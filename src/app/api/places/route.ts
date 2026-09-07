import { NextRequest, NextResponse } from "next/server";

// Live place search — OpenStreetMap Nominatim (free, no API key).
// Ported from the original YatraSetu (SIH) API, upgraded:
//  - no fake ratings or random distances (the original seeded `Math.random()`)
//  - optional `origin=lat,lng` computes REAL great-circle distances via haversine
//  - India-bounded by default, `full=1` escapes the bounding box

const NOMINATIM = "https://nominatim.openstreetmap.org/search";
const UA = "YatraSetu/2.0 (community restoration travel platform)";

const INDIA_BOX = "68.0,6.5,97.5,37.2"; // west,south,east,north

type NominatimResult = {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  type: string;
  class: string;
  importance: number;
  namedetails?: { name?: string };
};

const HOTELISH = new Set(["hotel", "hostel", "motel", "guesthouse", "apartment", "resort"]);
const STAYISH_CLASS = new Set(["tourism"]); // class=tourism & type in HOTELISH
const EATISH = new Set(["restaurant", "cafe", "fast_food", "food_court", "bar", "pub"]);
const TRANSPORTISH = new Set(["bus_station", "bus_stop", "taxi", "ferry_terminal", "railway", "station"]);

function greatCircleKm(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const R = 6371;
  const dLat = ((bLat - aLat) * Math.PI) / 180;
  const dLng = ((bLng - aLng) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((aLat * Math.PI) / 180) * Math.cos((bLat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

function categorize(r: NominatimResult): "stay" | "food" | "transport" | "attraction" {
  const t = r.type;
  if (HOTELISH.has(t) || (r.class === "tourism" && t === "hotel")) return "stay";
  if (EATISH.has(t)) return "food";
  if (TRANSPORTISH.has(t) || r.class === "railway" || r.class === "aeroway") return "transport";
  return "attraction";
}

type OsmPlace = {
  id: string;
  name: string;
  category: "stay" | "food" | "transport" | "attraction" | "locality";
  osmType: string;
  osmKind: string;
  address: string;
  lat: number;
  lng: number;
  distanceKm: number | null;
  importance?: number;
};

// Overpass API — free, keyless, reads the same OpenStreetMap database as
// Nominatim but can answer "POIs of these kinds around this point" directly.
async function nearbyPOIs(
  lat: number,
  lng: number,
  radiusM: number,
): Promise<OsmPlace[]> {
  const q = `[out:json][timeout:14];(
    node["tourism"~"hotel|hostel|guest_house|motel|attraction|viewpoint|museum|artwork|zoo"](around:${radiusM},${lat},${lng});
    node["amenity"~"restaurant|cafe|fast_food|food_court"](around:${radiusM},${lat},${lng});
    node["amenity"~"bus_station|bus_stop|taxi|ferry_terminal"](around:${radiusM},${lat},${lng});
    node["historic"~"monument|memorial|ruins|temple|castle|gates"](around:${radiusM},${lat},${lng});
  );out center tags 40;`; // 14s timeout, tags included, capped at 40 elements
  const res = await fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", "User-Agent": UA },
    body: `data=${encodeURIComponent(q)}`,
    next: { revalidate: 1800 },
  });
  if (!res.ok) throw new Error(`overpass ${res.status}`);
  const j = (await res.json()) as {
    elements: {
      type: string;
      id: number;
      lat?: number;
      lon?: number;
      center?: { lat: number; lon: number };
      tags?: Record<string, string>;
    }[];
  };
  return j.elements
    .map((el): OsmPlace | null => {
      const t = el.tags ?? {};
      const plat = el.lat ?? el.center?.lat;
      const plng = el.lon ?? el.center?.lon;
      if (plat == null || plng == null) return null;
      const a = t["amenity"];
      const to = t["tourism"];
      const hi = t["historic"];
      const category: OsmPlace["category"] =
        to === "hotel" || to === "hostel" || to === "guest_house" || to === "motel"
          ? "stay"
          : a === "restaurant" || a === "cafe" || a === "fast_food" || a === "food_court"
            ? "food"
            : a === "bus_station" || a === "bus_stop" || a === "taxi" || a === "ferry_terminal"
              ? "transport"
              : "attraction";
      return {
        id: `osm-${el.type[0]}${el.id}`,
        name: t.name ?? t["name:en"] ?? "Unnamed spot",
        category,
        osmType: to ? "tourism" : a ? "amenity" : "historic",
        osmKind: to ?? a ?? hi ?? "point",
        address: [t["addr:street"], t["addr:city"]].filter(Boolean).join(", "),
        lat: plat,
        lng: plng,
        distanceKm:
          Math.round(greatCircleKm(lat, lng, plat, plng) * 10) / 10,
      };
    })
    .filter((p): p is OsmPlace => p !== null && p.name !== "Unnamed spot")
    .sort((a, b) => (a.distanceKm ?? 9e9) - (b.distanceKm ?? 9e9))
    .slice(0, 12);
}

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const q = sp.get("q")?.trim();
  const originParam = sp.get("origin")?.trim() ?? sp.get("near")?.trim();
  const full = sp.get("full") === "1";

  let origin: { lat: number; lng: number } | null = null;
  if (originParam) {
    const [lat, lng] = originParam.split(",").map(Number);
    if (Number.isFinite(lat) && Number.isFinite(lng)) origin = { lat, lng };
  }

  // "near=lat,lng" (with or without a query) → genuine POIs around the point,
  // straight off OpenStreetMap via Overpass.
  if (origin && (q == null || q.length < 2)) {
    try {
      const places = await nearbyPOIs(origin.lat, origin.lng, 12000);
      return NextResponse.json({
        source: "openstreetmap-overpass",
        query: q ?? "",
        origin,
        count: places.length,
        places,
      });
    } catch {
      return NextResponse.json(
        { error: "Place search is unavailable right now.", source: "overpass" },
        { status: 502 },
      );
    }
  }

  if (!q || q.length < 2) {
    return NextResponse.json({ error: "Provide a search query (?q=)." }, { status: 400 });
  }

  const params = new URLSearchParams({
    q,
    format: "jsonv2",
    limit: "14",
    addressdetails: "0",
    namedetails: "1",
  });
  if (full) {
    // escape the India box entirely
  } else if (origin) {
    // "near" mode: bound the search to a box around the origin (≈30km) so
    // results are genuinely local to the place being viewed
    const d = 0.32;
    const box = [origin.lng - d, origin.lat - d, origin.lng + d, origin.lat + d]
      .map((n) => n.toFixed(3))
      .join(",");
    params.set("viewbox", box);
    params.set("bounded", "1");
  } else {
    params.set("viewbox", INDIA_BOX);
    params.set("bounded", "1");
  }

  let results: NominatimResult[];
  try {
    const res = await fetch(`${NOMINATIM}?${params}`, {
      headers: { "User-Agent": UA, "Accept-Language": "en" },
      next: { revalidate: 600 },
    });
    if (!res.ok) {
      return NextResponse.json(
        { error: "Place search is unavailable right now.", source: "nominatim", status: res.status },
        { status: 502 },
      );
    }
    results = (await res.json()) as NominatimResult[];
  } catch {
    return NextResponse.json(
      { error: "Place search is unavailable right now.", source: "nominatim" },
      { status: 502 },
    );
  }

  const places = results
    .filter((r) => {
      const c = categorize(r);
      if (c !== "attraction") return true; // stays, food, transport always pass
      // genuine points of interest pass; city/boundary shells are dropped —
      // but if nothing survives, the caller falls back to localities below
      return ["tourism", "historic", "leisure", "natural", "man_made"].includes(r.class);
    })
    .slice(0, 12)
    .map((r) => {
      const lat = Number(r.lat);
      const lng = Number(r.lon);
      const c = categorize(r);
      return {
        id: `osm-${r.place_id}`,
        name: r.namedetails?.name ?? r.display_name.split(",")[0],
        category: c,
        osmType: r.class,
        osmKind: r.type,
        address: r.display_name.split(",").slice(1, 4).join(",").trim(),
        lat,
        lng,
        distanceKm:
          origin && Number.isFinite(lat) && Number.isFinite(lng)
            ? Math.round(greatCircleKm(origin.lat, origin.lng, lat, lng) * 10) / 10
            : null,
        importance: r.importance,
      };
    });

  // A broad name (e.g. just "Varanasi") can yield only place/boundary shells.
  // Return them as localities rather than an empty result.
  const localities =
    places.length === 0
      ? results.slice(0, 6).map((r) => ({
          id: `osm-${r.place_id}`,
          name: r.namedetails?.name ?? r.display_name.split(",")[0],
          category: "locality" as const,
          osmType: r.class,
          osmKind: r.type,
          address: r.display_name.split(",").slice(1, 4).join(",").trim(),
          lat: Number(r.lat),
          lng: Number(r.lon),
          distanceKm: null,
          importance: r.importance,
        }))
      : [];

  const finalPlaces = places.length > 0 ? places : localities;

  return NextResponse.json({
    source: "openstreetmap",
    query: q,
    origin: origin ?? null,
    count: finalPlaces.length,
    places: finalPlaces,
  });
}
