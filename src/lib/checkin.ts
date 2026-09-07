import type { Prisma } from "@/generated/prisma/client";

/** Stable human-friendly check-in code for an event, e.g. "RIVER-4821". */
export function deriveCheckinCode(slug: string, title: string): string {
  const words = title.toLowerCase().replace(/[^a-z0-9 ]/g, "").split(/\s+/).filter(Boolean);
  const prefix = (words[0] ?? slug.slice(0, 4)).slice(0, 6).toUpperCase();
  let hash = 0;
  for (let i = 0; i < slug.length; i++) hash = (hash * 31 + slug.charCodeAt(i)) >>> 0;
  const digits = String(hash % 10000).padStart(4, "0");
  return `${prefix}-${digits}`;
}

/** Which stamp an event at this destination awards on verified check-in. */
export function stampCodeForDestination(slug: string): string {
  switch (slug) {
    case "rishikesh":
    case "varanasi":
    case "alleppey":
      return "JAL-MITRA";
    case "leh-ladakh":
      return "SHIKHAR";
    case "munnar":
    case "meghalaya":
    case "kaziranga":
    case "coorg":
      return "VAN-RAKSHAK";
    case "gokarna":
    case "jaisalmer":
      return "SAGAR-MITRA";
    default:
      return "RAKSHAK";
  }
}

export type AwardedStamp = { code: string; name: string; nameHindi: string | null; icon: string; color: string | null; tier: number };

/**
 * Award stamps for a verified attendance — runs inside the check-in
 * transaction so attendance, points and stamps commit or fail together:
 * - the destination's stamp (e.g. Jal Mitra for river events)
 * - Prabhat when the event starts before 8am
 * - Rakshak for the traveller's very first verified contribution
 * - Setu after three verified contributions in total
 */
export async function awardStamps(
  tx: Prisma.TransactionClient,
  userId: string,
  destinationSlug: string,
  eventStartTime: string,
  priorAttendanceCount: number,
): Promise<AwardedStamp[]> {
  const awarded: AwardedStamp[] = [];

  const owned = await tx.userStamp.findMany({
    where: { userId },
    select: { stamp: { select: { code: true } } },
  });
  const ownedCodes = new Set(owned.map((o) => o.stamp.code));
  const codes = new Set<string>([stampCodeForDestination(destinationSlug)]);

  if (priorAttendanceCount === 0) codes.add("RAKSHAK");
  if (eventStartTime < "08:00") codes.add("PRABHAT");
  if (priorAttendanceCount + 1 >= 3) codes.add("SETU");

  for (const code of codes) {
    if (ownedCodes.has(code)) continue;
    const stamp = await tx.stamp.findUnique({ where: { code } });
    if (!stamp) continue;
    await tx.userStamp.create({ data: { userId, stampId: stamp.id } });
    awarded.push({
      code: stamp.code,
      name: stamp.name,
      nameHindi: stamp.nameHindi,
      icon: stamp.icon,
      color: stamp.color,
      tier: stamp.tier,
    });
  }

  return awarded;
}

// ---------------------------------------------------------------- geofence

/** How far from the meeting point a device may be and still count as on-site. */
export const GEOFENCE_METERS = 200;

/** Parse the destination's "lat,lng" coordinate string. */
export function parseCoordinates(raw: string | null | undefined): { lat: number; lng: number } | null {
  if (!raw) return null;
  const [lat, lng] = raw.split(",").map(Number);
  return Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : null;
}

export function haversineMeters(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6_371_000;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/**
 * Geofence verdict for a check-in. `inside` is true/false when both the device
 * position and the site coordinates exist; null means no location proof was
 * available (denied GPS, or the site has no coordinates) — such check-ins are
 * accepted but marked unverified rather than faked.
 */
export function geofenceVerdict(
  device: { lat: number; lng: number } | null,
  site: { lat: number; lng: number } | null,
): { inside: boolean | null; distanceMeters: number | null } {
  if (!device || !site) return { inside: null, distanceMeters: null };
  const distanceMeters = haversineMeters(device, site);
  return { inside: distanceMeters <= GEOFENCE_METERS, distanceMeters: Math.round(distanceMeters) };
}

/** Whether check-in is currently open for an event (event day + 24h grace). */
export function checkinWindowOpen(eventDate: Date): boolean {
  const start = new Date(eventDate);
  start.setHours(0, 0, 0, 0);
  const end = new Date(eventDate);
  end.setDate(end.getDate() + 1);
  end.setHours(23, 59, 59, 999);
  const now = new Date();
  return now >= start && now <= end;
}