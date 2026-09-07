import { CalendarDays, CloudSun, Umbrella, Wind } from "lucide-react";
import { getWeather, advisoryFor, type WeatherData } from "@/lib/weather";
import { WeatherGlyph } from "@/components/weather/weather-glyph";
import { cn } from "@/lib/utils";

const LEVEL_STYLES = {
  good: "border-verify/25 bg-verify/8 text-verify",
  caution: "border-saffron/40 bg-saffron/10 text-saffron-deep",
  warning: "border-error/30 bg-error/10 text-error",
} as const;

const LEVEL_LABEL = {
  good: "Good working weather",
  caution: "Plan for it",
  warning: "Safety notice",
} as const;

/**
 * Server component — fetches the real forecast for the event's destination and
 * renders an advisory that changes with the data (rain → caution, storms →
 * warning). Never decorative: this is the pre-travel check.
 */
export async function EventWeather({
  lat,
  lng,
  eventDate,
}: {
  lat: number;
  lng: number;
  eventDate: Date;
}) {
  let weather: WeatherData | null = null;
  try {
    weather = await getWeather(lat, lng);
  } catch {
    weather = null;
  }

  if (!weather) {
    return (
      <div className="rounded-lg border border-dashed border-ink/15 p-5 text-sm text-stone">
        Weather data is temporarily unavailable — check the forecast before you travel.
      </div>
    );
  }

  const advisory = advisoryFor(weather, eventDate);
  const cur = weather.current;

  return (
    <div className="rounded-lg border border-ink/8 bg-paper-raised p-6 shadow-card">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <WeatherGlyph
            icon={cur?.icon ?? "cloud"}
            className="size-9 text-saffron-deep"
          />
          <div>
            <p className="font-display text-2xl tracking-tight text-ink">
              {cur?.tempC != null ? `${cur.tempC}°C` : "—"}
              {cur?.feelsLikeC != null && (
                <span className="ml-2 text-sm font-normal text-stone">
                  feels {cur.feelsLikeC}°
                </span>
              )}
            </p>
            <p className="text-xs text-stone">{cur?.label ?? "Forecast unavailable"}</p>
          </div>
        </div>
        <div className="flex gap-5 text-xs text-stone">
          {cur?.humidity != null && (
            <span className="flex items-center gap-1.5">
              <Umbrella className="size-3.5" aria-hidden />
              {cur.humidity}% humidity
            </span>
          )}
          {cur?.windKph != null && (
            <span className="flex items-center gap-1.5">
              <Wind className="size-3.5" aria-hidden />
              {cur.windKph} km/h
            </span>
          )}
        </div>
      </div>

      {advisory && (
        <div
          className={cn(
            "mt-5 flex items-start gap-3 rounded-md border p-4",
            LEVEL_STYLES[advisory.level],
          )}
          role="status"
        >
          <WeatherGlyph
            icon={
              advisory.level === "warning"
                ? "cloud-lightning"
                : advisory.level === "caution"
                  ? "cloud-rain"
                  : "sun"
            }
            className="mt-0.5 size-4 shrink-0"
          />
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em]">
              {LEVEL_LABEL[advisory.level]}
            </p>
            <p className="mt-1 text-sm leading-relaxed">{advisory.message}</p>
          </div>
        </div>
      )}

      <div className="mt-5 grid grid-cols-4 gap-2 border-t border-ink/8 pt-4">
        {weather.forecast.slice(0, 4).map((day) => {
          const isEventDay = day.date === new Date(eventDate).toISOString().slice(0, 10);
          return (
            <div
              key={day.date}
              className={cn(
                "rounded-md border px-2 py-3 text-center",
                isEventDay ? "border-saffron/50 bg-saffron/10" : "border-ink/8 bg-paper",
              )}
            >
              <p className="flex items-center justify-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-stone">
                <CalendarDays className="size-3" aria-hidden />
                {new Date(day.date + "T00:00:00").toLocaleDateString("en-IN", {
                  weekday: "short",
                })}
              </p>
              <WeatherGlyph icon={day.icon} className="mx-auto mt-1.5 size-5 text-stone" />
              <p className="mt-1 text-xs font-semibold text-ink">
                {day.maxC}° <span className="font-normal text-stone">{day.minC}°</span>
              </p>
              {day.rainChance != null && (
                <p className="text-[10px] text-stone">{day.rainChance}% rain</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
