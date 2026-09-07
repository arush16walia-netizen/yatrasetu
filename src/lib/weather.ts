import "server-only";

/**
 * Weather service — Open-Meteo (free, keyless).
 * Normalized shape consumed by the UI; the provider never leaks past this file.
 * Cached 30 min per coordinate via Next fetch revalidation.
 */

const OPEN_METEO = "https://api.open-meteo.com/v1/forecast";

const WMO: Record<number, { label: string; icon: string }> = {
  0: { label: "Clear sky", icon: "sun" },
  1: { label: "Mostly clear", icon: "sun" },
  2: { label: "Partly cloudy", icon: "cloud-sun" },
  3: { label: "Overcast", icon: "cloud" },
  45: { label: "Fog", icon: "cloud-fog" },
  48: { label: "Freezing fog", icon: "cloud-fog" },
  51: { label: "Light drizzle", icon: "cloud-drizzle" },
  53: { label: "Drizzle", icon: "cloud-drizzle" },
  55: { label: "Heavy drizzle", icon: "cloud-drizzle" },
  61: { label: "Light rain", icon: "cloud-rain" },
  63: { label: "Rain", icon: "cloud-rain" },
  65: { label: "Heavy rain", icon: "cloud-rain" },
  71: { label: "Light snow", icon: "snowflake" },
  73: { label: "Snow", icon: "snowflake" },
  75: { label: "Heavy snow", icon: "snowflake" },
  80: { label: "Rain showers", icon: "cloud-rain" },
  81: { label: "Showers", icon: "cloud-rain" },
  82: { label: "Violent showers", icon: "cloud-rain" },
  95: { label: "Thunderstorm", icon: "cloud-lightning" },
  96: { label: "Storm with hail", icon: "cloud-lightning" },
  99: { label: "Storm with hail", icon: "cloud-lightning" },
};

export type WeatherForecastDay = {
  date: string;
  maxC: number;
  minC: number;
  rainChance: number | null;
  label: string;
  icon: string;
};

export type WeatherData = {
  current: {
    tempC: number | null;
    feelsLikeC: number | null;
    humidity: number | null;
    windKph: number | null;
    label: string;
    icon: string;
  } | null;
  forecast: WeatherForecastDay[];
  timezone: string | null;
};

/** How the UI should advise an event attendee given the day's forecast. */
export type Advisory = {
  level: "good" | "caution" | "warning";
  message: string;
};

export function advisoryFor(
  weather: WeatherData | null,
  eventDate?: Date | string | null,
): Advisory | null {
  if (!weather?.forecast?.length) return null;

  // Find the forecast day matching the event (or fall back to day 0).
  let day = weather.forecast[0];
  if (eventDate) {
    const target = new Date(eventDate).toISOString().slice(0, 10);
    const match = weather.forecast.find((f) => f.date === target);
    if (match) day = match;
  }

  const rain = day.rainChance ?? 0;
  const max = day.maxC ?? 0;

  if (day.icon === "cloud-lightning" || day.label.includes("Storm")) {
    return {
      level: "warning",
      message: `Thunderstorms expected (${day.label.toLowerCase()}, ${rain}% rain chance). Consider rescheduling — safety first.`,
    };
  }
  if (rain >= 60 || day.icon === "cloud-rain" || day.icon === "cloud-drizzle") {
    return {
      level: "caution",
      message: `Rain likely (${rain}% chance, ${day.label.toLowerCase()}). Carry waterproof gear and protect collection bags.`,
    };
  }
  if (max >= 38) {
    return {
      level: "caution",
      message: `Extreme heat forecast (${max}°C). Shift heavy work to early morning and keep hydration stops frequent.`,
    };
  }
  if (day.icon === "cloud-fog" || day.label.includes("Fog")) {
    return {
      level: "caution",
      message: `Fog expected — visibility will be low on trails. Carry a light and stay with the crew.`,
    };
  }
  if (max >= 30 && max < 38) {
    return {
      level: "caution",
      message: `Warm day (${max}°C). Extra water breaks for the crew.`,
    };
  }
  return {
    level: "good",
    message: `${day.label}, ${day.minC}°–${day.maxC}° — good working weather for the crew.`,
  };
}

export async function getWeather(lat: number, lng: number): Promise<WeatherData | null> {
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lng),
    current: "temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m",
    daily: "temperature_2m_max,temperature_2m_min,weather_code,precipitation_probability_max",
    timezone: "auto",
    forecast_days: "4",
  });

  try {
    const res = await fetch(`${OPEN_METEO}?${params}`, { next: { revalidate: 1800 } });
    if (!res.ok) return null;
    const j = (await res.json()) as {
      current?: Record<string, number>;
      daily?: {
        time: string[];
        temperature_2m_max: number[];
        temperature_2m_min: number[];
        weather_code: number[];
        precipitation_probability_max: (number | null)[];
      };
      timezone?: string;
    };

    const code = j.current?.weather_code ?? 0;
    const wmo = WMO[code] ?? { label: "—", icon: "cloud" };

    const forecast: WeatherForecastDay[] = (j.daily?.time ?? []).slice(0, 4).map((t, i) => {
      const c = j.daily!.weather_code[i];
      const w = WMO[c] ?? { label: "—", icon: "cloud" };
      return {
        date: t,
        maxC: Math.round(j.daily!.temperature_2m_max[i]),
        minC: Math.round(j.daily!.temperature_2m_min[i]),
        rainChance: j.daily!.precipitation_probability_max[i] ?? null,
        label: w.label,
        icon: w.icon,
      };
    });

    return {
      current: {
        tempC: j.current?.temperature_2m != null ? Math.round(j.current.temperature_2m) : null,
        feelsLikeC:
          j.current?.apparent_temperature != null ? Math.round(j.current.apparent_temperature) : null,
        humidity: j.current?.relative_humidity_2m ?? null,
        windKph: j.current?.wind_speed_10m != null ? Math.round(j.current.wind_speed_10m) : null,
        label: wmo.label,
        icon: wmo.icon,
      },
      forecast,
      timezone: j.timezone ?? null,
    };
  } catch {
    return null;
  }
}
