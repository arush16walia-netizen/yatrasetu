/**
 * Swachh Yatra taxonomy — the single owner of litter categories, volumes and
 * their display labels. The API validates against the keys; forms and feeds
 * render the labels.
 */
export const LITTER_CATEGORIES = [
  { key: "PLASTIC", label: "Plastic bottles" },
  { key: "WRAPPERS", label: "Wrappers & sachets" },
  { key: "CAMPING", label: "Camping gear" },
  { key: "GLASS", label: "Broken glass" },
  { key: "INDUSTRIAL", label: "Industrial rubble" },
] as const;

export const LITTER_VOLUMES = [
  { key: "LIGHT", label: "1–5 kg" },
  { key: "MODERATE", label: "5–15 kg" },
  { key: "HEAVY", label: "15 kg+" },
] as const;

export function litterCategoryLabel(key: string): string {
  return LITTER_CATEGORIES.find((c) => c.key === key)?.label ?? key;
}

export function litterVolumeLabel(key: string): string {
  return LITTER_VOLUMES.find((v) => v.key === key)?.label ?? key;
}
