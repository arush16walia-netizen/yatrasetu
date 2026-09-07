import "server-only";
import { prisma } from "@/lib/prisma";
import { parseJSONArray } from "@/lib/utils";

export type DestinationSummary = {
  id: string;
  slug: string;
  name: string;
  hindiName: string | null;
  region: string;
  tagline: string;
  image: string;
  imageAlt: string;
  needsCare: string | null;
  mapX: number | null;
  mapY: number | null;
  knownFor: string[];
  coordinates: string | null;
  story: string;
  heroImage: string | null;
  bestSeason: string | null;
  careImage: string | null;
  featured: boolean;
};

export function toDestinationSummary(d: {
  id: string;
  slug: string;
  name: string;
  hindiName: string | null;
  region: string;
  tagline: string;
  image: string;
  imageAlt: string;
  needsCare: string | null;
  mapX: number | null;
  mapY: number | null;
  coordinates: string | null;
  story: string;
  heroImage: string | null;
  bestSeason: string | null;
  careImage: string | null;
  featured: boolean;
  knownFor: string;
}): DestinationSummary {
  return {
    id: d.id,
    slug: d.slug,
    name: d.name,
    hindiName: d.hindiName,
    region: d.region,
    tagline: d.tagline,
    image: d.image,
    imageAlt: d.imageAlt,
    needsCare: d.needsCare,
    mapX: d.mapX,
    mapY: d.mapY,
    coordinates: d.coordinates,
    story: d.story,
    heroImage: d.heroImage,
    bestSeason: d.bestSeason,
    careImage: d.careImage,
    featured: d.featured,
    knownFor: parseJSONArray<string>(d.knownFor),
  };
}

export async function getDestinations(limit?: number): Promise<DestinationSummary[]> {
  const rows = await prisma.destination.findMany({
    orderBy: [{ featured: "desc" }, { name: "asc" }],
    take: limit,
  });
  return rows.map(toDestinationSummary);
}

export async function getDestinationBySlug(slug: string): Promise<DestinationSummary | null> {
  const row = await prisma.destination.findUnique({ where: { slug } });
  return row ? toDestinationSummary(row) : null;
}

export type EventSummary = {
  id: string;
  slug: string;
  title: string;
  date: Date;
  startTime: string;
  endTime: string | null;
  meetingPoint: string;
  description: string;
  whatToBring: string;
  capacity: number;
  organizerName: string;
  image: string;
  status: string;
  destination: { slug: string; name: string; region: string };
  confirmedCount: number;
};

export async function getUpcomingEvents(limit?: number): Promise<EventSummary[]> {
  const rows = await prisma.restorationEvent.findMany({
    where: { date: { gte: new Date() } },
    orderBy: { date: "asc" },
    take: limit,
    include: {
      destination: { select: { slug: true, name: true, region: true } },
      rsvps: { select: { status: true } },
    },
  });
  return rows.map((e) => ({
    id: e.id,
    slug: e.slug,
    title: e.title,
    date: e.date,
    startTime: e.startTime,
    endTime: e.endTime,
    meetingPoint: e.meetingPoint,
    description: e.description,
    whatToBring: e.whatToBring,
    capacity: e.capacity,
    organizerName: e.organizerName,
    image: e.image,
    status: e.status,
    destination: e.destination,
    confirmedCount: e.rsvps.filter((r) => r.status === "CONFIRMED").length,
  }));
}

export async function getEventBySlug(slug: string) {
  const row = await prisma.restorationEvent.findUnique({
    where: { slug },
    select: {
      id: true,
      slug: true,
      title: true,
      date: true,
      startTime: true,
      endTime: true,
      meetingPoint: true,
      description: true,
      whatToBring: true,
      capacity: true,
      organizerName: true,
      image: true,
      status: true,
      checkinCode: true,
      destination: { select: { slug: true, name: true, region: true, image: true } },
      rsvps: { select: { status: true } },
    },
  });
  if (!row) return null;
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    date: row.date,
    startTime: row.startTime,
    endTime: row.endTime,
    meetingPoint: row.meetingPoint,
    description: row.description,
    whatToBring: row.whatToBring,
    capacity: row.capacity,
    organizerName: row.organizerName,
    image: row.image,
    status: row.status,
    checkinCode: row.checkinCode,
    destination: row.destination,
    confirmedCount: row.rsvps.filter((r) => r.status === "CONFIRMED").length,
  };
}

export async function getStays() {
  const rows = await prisma.stay.findMany({
    orderBy: { rating: "desc" },
    include: { destination: { select: { slug: true, name: true, region: true } } },
  });
  return rows.map((s) => ({
    id: s.id,
    name: s.name,
    description: s.description,
    image: s.image,
    pricePerNight: s.pricePerNight,
    rating: s.rating,
    amenityTags: parseJSONArray<string>(s.amenityTags),
    ecoBadge: s.ecoBadge,
    destination: s.destination,
  }));
}

export async function getItineraries() {
  const rows = await prisma.itinerary.findMany({
    orderBy: { durationDays: "asc" },
    include: {
      destination: { select: { slug: true, name: true, region: true } },
      stops: { orderBy: { day: "asc" } },
    },
  });
  return rows.map((i) => ({
    id: i.id,
    title: i.title,
    durationDays: i.durationDays,
    summary: i.summary,
    image: i.image,
    bestFor: i.bestFor,
    destination: i.destination,
    stops: i.stops,
  }));
}

export async function getStaysByDestination(slug: string) {
  const dest = await prisma.destination.findUnique({ where: { slug } });
  if (!dest) return [];
  const rows = await prisma.stay.findMany({
    where: { destinationId: dest.id },
    orderBy: { rating: "desc" },
  });
  return rows.map((s) => ({
    id: s.id,
    name: s.name,
    description: s.description,
    image: s.image,
    pricePerNight: s.pricePerNight,
    rating: s.rating,
    amenityTags: parseJSONArray<string>(s.amenityTags),
    ecoBadge: s.ecoBadge,
  }));
}

export async function getItinerariesByDestination(slug: string) {
  const dest = await prisma.destination.findUnique({ where: { slug } });
  if (!dest) return [];
  const rows = await prisma.itinerary.findMany({
    where: { destinationId: dest.id },
    include: { stops: { orderBy: { day: "asc" } } },
  });
  return rows.map((i) => ({
    id: i.id,
    title: i.title,
    durationDays: i.durationDays,
    summary: i.summary,
    image: i.image,
    bestFor: i.bestFor,
    stops: i.stops,
  }));
}

export async function getEventsByDestination(slug: string, limit?: number) {
  const dest = await prisma.destination.findUnique({ where: { slug } });
  if (!dest) return [];
  const rows = await prisma.restorationEvent.findMany({
    where: { destinationId: dest.id, date: { gte: new Date() } },
    orderBy: { date: "asc" },
    take: limit,
    include: {
      destination: { select: { slug: true, name: true, region: true } },
      rsvps: { select: { status: true } },
    },
  });
  return rows.map((e) => ({
    id: e.id,
    slug: e.slug,
    title: e.title,
    date: e.date,
    startTime: e.startTime,
    endTime: e.endTime,
    meetingPoint: e.meetingPoint,
    description: e.description,
    whatToBring: e.whatToBring,
    capacity: e.capacity,
    organizerName: e.organizerName,
    image: e.image,
    status: e.status,
    destination: e.destination,
    confirmedCount: e.rsvps.filter((r) => r.status === "CONFIRMED").length,
  }));
}

export async function getStamps() {
  const rows = await prisma.stamp.findMany({ orderBy: { tier: "asc" } });
  return rows;
}

export async function getRewards() {
  const rows = await prisma.reward.findMany({ orderBy: { costStamps: "asc" } });
  return rows;
}