"use client";

import { useEffect, useState } from "react";
import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSun,
  Droplets,
  Loader2,
  MapPin,
  Navigation,
  Snowflake,
  Sun,
  Utensils,
  Wind,
} from "lucide-react";
import { Reveal } from "@/components/ui/reveal";
import { cn } from "@/lib/utils";

const ICONS: Record<string, typeof Sun> = {
  sun: Sun,
  "cloud-sun": CloudSun,
  cloud: Cloud,
  "cloud-fog": CloudFog,
  "cloud-drizzle": CloudDrizzle,
  "cloud-rain": CloudRain,
  "cloud-lightning": CloudLightning,
  snowflake: Snowflake,
};

type Weather = {
  current: {
    tempC: number | null;
    feelsLikeC: number | null;
    humidity: number | null;
    windKph: number | null;
    label: string;
    icon: string;
  } | null;
  forecast: { date: string; maxC: number; minC: number; rainChance: number | null; label: string; icon: string }[];
};

type Place = {
  id: string;
  name: string;
  category: "stay" | "food" | "transport" | "attraction" | "locality";
  address: string;
  distanceKm: number | null;
};

const CATEGORY_LABEL: Record<Place["category"], string> = {
  stay: "Stay",
  food: "Eat",
  transport: "Getting there",
  attraction: "See",
  locality: "Locality",
};

const CATEGORY_ICON: Record<Place["category"], typeof Sun> = {
  stay: Sun,
  food: Utensils,
  transport: Navigation,
  attraction: MapPin,
  locality: MapPin,
};

export function GroundPanel({
  name,
  lat,
  lng,
}: {
  name: string;
  lat: number;
  lng: number;
}) {
  const [weather, setWeather] = useState<Weather | null>(null);
  const [places, setPlaces] = useState<Place[] | null>(null);
  const [weatherError, setWeatherError] = useState(false);
  const [placesError, setPlacesError] = useState(false);

  useEffect(() => {
    let alive = true;
    fetch(`/api/weather?lat=${lat}&lng=${lng}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => alive && setWeather(d))
      .catch(() => alive && setWeatherError(true));
    fetch(`/api/places?near=${lat},${lng}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => alive && setPlaces(d.places ?? []))
      .catch(() => alive && setPlacesError(true));
    return () => {
      alive = false;
    };
  }, [name, lat, lng]);

  const loadingWeather = !weather && !weatherError;
  const loadingPlaces = !places && !placesError;
  const WeatherIcon = weather?.current ? ICONS[weather.current.icon] ?? Cloud : Cloud;

  return (
    <div className="grid gap-5 lg:grid-cols-[340px_1fr]">
      {/* Weather card */}
      <Reveal>
        <div className="h-full rounded-lg border border-ink/8 bg-ink p-6 text-paper shadow-card">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-saffron">
            On the ground, right now
          </p>

          {loadingWeather && (
            <p className="mt-8 flex items-center gap-2 text-sm text-paper/60">
              <Loader2 className="size-4 animate-spin" aria-hidden />
              Reading the sky over {name}…
            </p>
          )}
          {weatherError && (
            <p className="mt-8 text-sm leading-relaxed text-paper/60">
              Weather is shy at the moment. It&rsquo;s usually worth the trip anyway.
            </p>
          )}

          {weather?.current && (
            <>
              <div className="mt-5 flex items-center gap-4">
                <WeatherIcon className="size-10 text-saffron" aria-hidden />
                <div>
                  <p className="font-display text-5xl tracking-tight">{weather.current.tempC}°C</p>
                  <p className="text-sm text-paper/70">{weather.current.label}</p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-paper/60">
                {weather.current.feelsLikeC != null && (
                  <span>Feels {weather.current.feelsLikeC}°</span>
                )}
                {weather.current.humidity != null && (
                  <span className="inline-flex items-center gap-1">
                    <Droplets className="size-3" aria-hidden />
                    {weather.current.humidity}%
                  </span>
                )}
                {weather.current.windKph != null && (
                  <span className="inline-flex items-center gap-1">
                    <Wind className="size-3" aria-hidden />
                    {weather.current.windKph} km/h
                  </span>
                )}
              </div>
              <div className="mt-6 grid grid-cols-4 gap-2 border-t border-paper/10 pt-5">
                {weather.forecast.slice(0, 4).map((f) => {
                  const FIcon = ICONS[f.icon] ?? Cloud;
                  return (
                    <div key={f.date} className="text-center">
                      <p className="text-[10px] uppercase tracking-wider text-paper/50">
                        {new Date(f.date).toLocaleDateString("en-IN", { weekday: "short" })}
                      </p>
                      <FIcon className="mx-auto mt-1.5 size-4 text-saffron/90" aria-hidden />
                      <p className="mt-1 text-xs font-semibold">{f.maxC}°</p>
                      <p className="text-[10px] text-paper/50">{f.minC}°</p>
                    </div>
                  );
                })}
              </div>
              <p className="mt-4 text-[10px] text-paper/40">Live via Open-Meteo</p>
            </>
          )}
        </div>
      </Reveal>

      {/* Nearby, live from OpenStreetMap */}
      <Reveal delay={0.08}>
        <div className="h-full rounded-lg border border-ink/8 bg-paper-raised p-6 shadow-card">
          <div className="flex items-center justify-between gap-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-saffron-deep">
              Around {name}, mapped live
            </p>
            <span className="text-[10px] text-stone">OpenStreetMap · 12 km</span>
          </div>

          {loadingPlaces && (
            <p className="mt-8 flex items-center gap-2 text-sm text-stone">
              <Loader2 className="size-4 animate-spin" aria-hidden />
              Asking the map what&rsquo;s nearby…
            </p>
          )}
          {placesError && (
            <p className="mt-8 text-sm text-stone">
              The map isn&rsquo;t answering right now — try again in a moment.
            </p>
          )}

          {places && places.length === 0 && (
            <p className="mt-8 text-sm text-stone">
              No mapped points of interest found for this search — part of {name}&rsquo;s charm.
            </p>
          )}

          {places && places.length > 0 && (
            <ul className="mt-5 grid gap-2 sm:grid-cols-2">
              {places.slice(0, 8).map((p) => {
                const PIcon = CATEGORY_ICON[p.category] ?? MapPin;
                return (
                  <li
                    key={p.id}
                    className={cn(
                      "flex items-start gap-3 rounded-md border border-ink/8 bg-paper px-4 py-3",
                    )}
                  >
                    <PIcon className="mt-0.5 size-4 shrink-0 text-saffron-deep" aria-hidden />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-ink">{p.name}</p>
                      <p className="truncate text-xs text-stone">
                        {CATEGORY_LABEL[p.category]}
                        {p.distanceKm != null && (
                          <> · {p.distanceKm < 1 ? `${Math.round(p.distanceKm * 1000)} m` : `${p.distanceKm} km`} away</>
                        )}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </Reveal>
    </div>
  );
}
