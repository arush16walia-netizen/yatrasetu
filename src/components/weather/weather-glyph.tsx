import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSun,
  Snowflake,
  Sun,
} from "lucide-react";

const GLYPHS: Record<string, typeof Sun> = {
  sun: Sun,
  "cloud-sun": CloudSun,
  cloud: Cloud,
  "cloud-fog": CloudFog,
  "cloud-drizzle": CloudDrizzle,
  "cloud-rain": CloudRain,
  snowflake: Snowflake,
  "cloud-lightning": CloudLightning,
};

/** Maps the weather service's icon key to a lucide glyph. */
export function WeatherGlyph({ icon, className }: { icon: string; className?: string }) {
  const Glyph = GLYPHS[icon] ?? Cloud;
  return <Glyph className={className} aria-hidden />;
}
