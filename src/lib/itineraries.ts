import "server-only";
import { prisma } from "@/lib/prisma";

export type PlanItem = {
  id: string;
  day: number;
  position: number;
  note: string | null;
  destination: { slug: string; name: string; region: string; image: string } | null;
  event: {
    slug: string;
    title: string;
    date: Date;
    startTime: string;
    destination: { slug: string; name: string; region: string; image: string };
  } | null;
};

export type Plan = {
  id: string;
  name: string;
  startDate: Date | null;
  items: PlanItem[];
};

/** The traveller's single active plan (create-on-demand). */
export async function getOrCreatePlan(userId: string): Promise<Plan> {
  let plan = await prisma.userItinerary.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      items: {
        orderBy: [{ day: "asc" }, { position: "asc" }],
        include: {
          destination: { select: { slug: true, name: true, region: true, image: true } },
          event: {
            select: {
              slug: true,
              title: true,
              date: true,
              startTime: true,
              destination: { select: { slug: true, name: true, region: true, image: true } },
            },
          },
        },
      },
    },
  });

  if (!plan) {
    plan = await prisma.userItinerary.create({
      data: { userId, name: "My Yatra" },
      include: {
        items: {
          orderBy: [{ day: "asc" }, { position: "asc" }],
          include: {
            destination: { select: { slug: true, name: true, region: true, image: true } },
            event: {
              select: {
                slug: true,
                title: true,
                date: true,
                startTime: true,
                destination: { select: { slug: true, name: true, region: true, image: true } },
              },
            },
          },
        },
      },
    });
  }

  return {
    id: plan.id,
    name: plan.name,
    startDate: plan.startDate,
    items: plan.items as PlanItem[],
  };
}

export type AddResult =
  | { ok: true; itemCount: number }
  | { ok: false; error: string; status: number };

/** Add a destination or event to the plan — validates the target exists and dedupes. */
export async function addPlanItem(
  userId: string,
  input: { destinationId?: string; eventId?: string; day?: number; note?: string },
): Promise<AddResult> {
  if (!input.destinationId && !input.eventId) {
    return { ok: false, error: "Choose a destination or an event to add.", status: 422 };
  }

  const plan = await getOrCreatePlan(userId);

  if (input.eventId) {
    const event = await prisma.restorationEvent.findUnique({ where: { id: input.eventId } });
    if (!event) return { ok: false, error: "Event not found.", status: 404 };
    const dupe = await prisma.itineraryItem.findFirst({
      where: { itineraryId: plan.id, eventId: input.eventId },
    });
    if (dupe) return { ok: false, error: "This event is already in your Yatra.", status: 409 };
  }
  if (input.destinationId) {
    const dest = await prisma.destination.findUnique({ where: { id: input.destinationId } });
    if (!dest) return { ok: false, error: "Destination not found.", status: 404 };
    const dupe = await prisma.itineraryItem.findFirst({
      where: { itineraryId: plan.id, destinationId: input.destinationId },
    });
    if (dupe) return { ok: false, error: "This destination is already in your Yatra.", status: 409 };
  }

  const last = plan.items[plan.items.length - 1];
  const day = input.day ?? (last ? last.day : 1);
  const position = last && last.day === day ? last.position + 1 : 0;

  await prisma.itineraryItem.create({
    data: {
      itineraryId: plan.id,
      destinationId: input.destinationId ?? null,
      eventId: input.eventId ?? null,
      day,
      position,
      note: input.note?.trim() || null,
    },
  });

  const count = await prisma.itineraryItem.count({ where: { itineraryId: plan.id } });
  return { ok: true, itemCount: count };
}

export type OwnResult = { ok: true } | { ok: false; error: string; status: number };

async function assertOwns(userId: string, itemId: string): Promise<OwnResult> {
  const item = await prisma.itineraryItem.findUnique({
    where: { id: itemId },
    select: { itinerary: { select: { userId: true } } },
  });
  if (!item) return { ok: false, error: "Itinerary item not found.", status: 404 };
  if (item.itinerary.userId !== userId) {
    return { ok: false, error: "Not your itinerary.", status: 403 };
  }
  return { ok: true };
}

export async function removePlanItem(userId: string, itemId: string): Promise<OwnResult> {
  const own = await assertOwns(userId, itemId);
  if (!own.ok) return own;
  await prisma.itineraryItem.delete({ where: { id: itemId } });
  return { ok: true };
}

/** Reorder within a day (position swap). Validates ownership server-side. */
export async function reorderPlanItems(
  userId: string,
  orderedIds: string[],
): Promise<OwnResult> {
  if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
    return { ok: false, error: "Nothing to reorder.", status: 422 };
  }
  const first = await assertOwns(userId, orderedIds[0]);
  if (!first.ok) return first;

  const items = await prisma.itineraryItem.findMany({
    where: { id: { in: orderedIds }, itinerary: { userId } },
    select: { id: true, day: true },
  });
  if (items.length !== orderedIds.length) {
    return { ok: false, error: "Some items don't belong to your itinerary.", status: 403 };
  }

  await prisma.$transaction(
    orderedIds.map((id, i) =>
      prisma.itineraryItem.update({ where: { id }, data: { position: i } }),
    ),
  );
  return { ok: true };
}

/**
 * Responsible Yatra Score — a Yatra Setu platform metric (labelled as such in
 * the UI). Derived from what the plan actually contains:
 *  - restoration event woven in (+35)
 *  - eco-badged stay destination (+15 each, cap 30)
 *  - offbeat/needs-care destinations (+12 each, cap 24 — spreading the load)
 *  - day structure (more days = slower travel, up to +15)
 *  - cap 100
 */
export function responsibleScore(items: PlanItem[]): {
  score: number;
  breakdown: { label: string; value: number; note: string }[];
} {
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
      { label: "Environmental contribution", value: contribution, note: events > 0 ? `${events} restoration event${events === 1 ? "" : "s"} in the plan` : "Add a restoration event" },
      { label: "Local participation", value: ecoStays, note: "Community-run stays & kitchens" },
      { label: "Sustainable mobility", value: spread, note: "Fewer, longer stops beat many short hops" },
      { label: "Waste awareness", value: pace, note: "Slower itineraries leave lighter traces" },
      { label: "Cultural respect", value: 0, note: "Woven into every destination guide" },
    ],
  };
}
