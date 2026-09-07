import { NextRequest, NextResponse } from "next/server";
import { getWeather } from "@/lib/weather";

// Live weather — proxied through the shared service module so the provider
// (Open-Meteo, free, keyless) stays isolated behind /lib/weather.ts.

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const lat = Number(sp.get("lat"));
  const lng = Number(sp.get("lng"));

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return NextResponse.json({ error: "Provide ?lat= & ?lng= (decimal degrees)." }, { status: 400 });
  }

  const data = await getWeather(lat, lng);
  if (!data) {
    return NextResponse.json(
      { error: "Weather is unavailable right now.", source: "open-meteo" },
      { status: 502 },
    );
  }
  return NextResponse.json({ ...data, source: "open-meteo" });
}
