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

const planInclude = {
  items: {
    orderBy: [{ day: "asc" as const }, { position: "asc" as const }],
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
};

/** The traveller's single active plan (create-on-demand). */
export async function getOrCreatePlan(userId: string): Promise<Plan> {
  let plan = await prisma.userItinerary.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: planInclude,
  });

  if (!plan) {
    plan = await prisma.userItinerary.create({
      data: { userId, name: "My Yatra" },
      include: planInclude,
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
