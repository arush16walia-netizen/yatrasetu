import "server-only";
import { prisma } from "@/lib/prisma";
import { toDestinationSummary, type DestinationSummary } from "@/lib/queries";

/**
 * Crowd pressure — a Yatra Setu platform estimate of visitor pressure on a
 * destination, 0–100. NOT a live statistic: values are seeded platform
 * estimates, and the UI labels them as such.
 */

export const CROWD_BANDS = [
  { max: 39, key: "gentle", label: "Gentle footfall", tone: "teal" as const },
  { max: 69, key: "building", label: "Building pressure", tone: "saffron" as const },
  { max: 100, key: "loving-too-hard", label: "Loved too hard", tone: "ink" as const },
];

export function crowdBand(score: number) {
  return CROWD_BANDS.find((b) => score <= b.max) ?? CROWD_BANDS[CROWD_BANDS.length - 1];
}

/** Destinations the crowd hasn't found yet — the responsible alternatives. */
export async function getUnderratedDestinations(limit = 4): Promise<DestinationSummary[]> {
  const rows = await prisma.destination.findMany({
    orderBy: { crowdScore: "asc" },
    take: limit,
  });
  return rows.map(toDestinationSummary);
}

/** The destinations carrying the heaviest visitor pressure. */
export async function getPressuredDestinations(limit = 4): Promise<DestinationSummary[]> {
  const rows = await prisma.destination.findMany({
    orderBy: { crowdScore: "desc" },
    take: limit,
  });
  return rows.map(toDestinationSummary);
}
