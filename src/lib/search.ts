import "server-only";
import { prisma } from "@/lib/prisma";

export type SearchHit = {
  type: "destination" | "event" | "stay" | "itinerary";
  title: string;
  subtitle: string;
  href: string;
};

/** Global search across the four content types. Simple contains-match — fast and honest. */
export async function globalSearch(q: string): Promise<SearchHit[]> {
  const term = q.trim();
  if (term.length < 2) return [];

  const [destinations, events, stays, itineraries] = await Promise.all([
    prisma.destination.findMany({
      where: {
        OR: [
          { name: { contains: term } },
          { region: { contains: term } },
          { tagline: { contains: term } },
        ],
      },
      take: 6,
      select: { slug: true, name: true, region: true, tagline: true },
    }),
    prisma.restorationEvent.findMany({
      where: {
        OR: [{ title: { contains: term } }, { description: { contains: term } }],
      },
      orderBy: { date: "asc" },
      take: 5,
      select: {
        slug: true,
        title: true,
        date: true,
        destination: { select: { name: true } },
      },
    }),
    prisma.stay.findMany({
      where: { OR: [{ name: { contains: term } }, { description: { contains: term } }] },
      take: 4,
      select: { id: true, name: true, destination: { select: { name: true } } },
    }),
    prisma.itinerary.findMany({
      where: { OR: [{ title: { contains: term } }, { summary: { contains: term } }] },
      take: 4,
      select: { id: true, title: true, durationDays: true, destination: { select: { name: true } } },
    }),
  ]);

  return [
    ...destinations.map((d) => ({
      type: "destination" as const,
      title: d.name,
      subtitle: `${d.region} · ${d.tagline}`,
      href: `/explore/${d.slug}`,
    })),
    ...events.map((e) => ({
      type: "event" as const,
      title: e.title,
      subtitle: `${e.destination.name} · restoration event`,
      href: `/events/${e.slug}`,
    })),
    ...stays.map((s) => ({
      type: "stay" as const,
      title: s.name,
      subtitle: `${s.destination.name} · stay`,
      href: "/stays",
    })),
    ...itineraries.map((i) => ({
      type: "itinerary" as const,
      title: i.title,
      subtitle: `${i.durationDays} days · curated itinerary`,
      href: `/itinerary#${i.id}`,
    })),
  ];
}
