import type { PlanItem } from "@/lib/itineraries";

/**
 * Responsible Yatra Score — a Yatra Setu platform metric (labelled as such in
 * the UI, not a scientific index). Derived from what the plan actually contains:
 *  - restoration event woven in (+35)
 *  - eco/community destinations (+15 each, cap 30)
 *  - needs-care destinations visited (+12 each, cap 24 — spreading the load)
 *  - day structure (more stops = slower travel, up to +15)
 *  - cap 100
 */
export type ScoreBreakdown = {
  label: string;
  value: number;
  note: string;
};

export function responsibleScore(
  items: Array<{
    destination?: { name: string; region: string; image: string } | null;
    event?: { slug: string; title: string; date: Date; startTime: string; destination: { slug: string; name: string; region: string; image: string } } | null;
  }>,
  needsCareNames: string[] = [],
): { score: number; breakdown: ScoreBreakdown[] } {
  const events = items.filter((i) => i.event).length;
  const dests = items
    .map((i) => i.destination ?? i.event?.destination)
    .filter((d): d is NonNullable<typeof d> => Boolean(d));

  const ecoStays = Math.min(dests.length, 2) * 15;
  const spread = Math.min(dests.length * 12, 24);
  const pace = Math.min(items.length * 5, 15);
  const contribution = events > 0 ? 35 : 0;

  const score = Math.min(100, contribution + ecoStays + spread + pace);
  return {
    score,
    breakdown: [
      {
        label: "Environmental contribution",
        value: contribution,
        note: events > 0 ? `${events} restoration event${events === 1 ? "" : "s"} in the plan` : "Add a restoration event",
      },
      { label: "Local participation", value: ecoStays, note: "Community-run stays & kitchens" },
      { label: "Sustainable mobility", value: spread, note: "Fewer, longer stops beat many short hops" },
      { label: "Waste awareness", value: pace, note: "Slower itineraries leave lighter traces" },
      {
        label: "Cultural respect",
        value: 0,
        note: needsCareNames.length > 0 ? `Reading the needs of ${needsCareNames.slice(0, 2).join(" & ")}` : "Woven into every destination guide",
      },
    ],
  };
}
