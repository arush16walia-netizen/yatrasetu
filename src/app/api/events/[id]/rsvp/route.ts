import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in to RSVP." }, { status: 401 });
  }

  const { id } = await params;
  let action: "join" | "cancel" = "join";
  try {
    const body = await request.json();
    if (body?.action === "cancel") action = "cancel";
  } catch {
    // no body — treat as join
  }

  const event = await prisma.restorationEvent.findUnique({
    where: { id },
    include: {
      rsvps: { where: { status: { in: ["CONFIRMED", "ATTENDED"] } } },
    },
  });

  if (!event) {
    return NextResponse.json({ error: "Event not found." }, { status: 404 });
  }
  if (event.date < new Date()) {
    return NextResponse.json({ error: "This event has already happened." }, { status: 400 });
  }
  if (event.status === "CANCELLED") {
    return NextResponse.json({ error: "This event was cancelled." }, { status: 400 });
  }

  const existing = await prisma.eventRSVP.findUnique({
    where: { eventId_userId: { eventId: id, userId: session.user.id } },
  });

  if (action === "cancel") {
    if (!existing || existing.status === "CANCELLED") {
      return NextResponse.json({ error: "You haven't RSVP'd to this event." }, { status: 400 });
    }
    // Can't cancel after attending
    if (existing.status === "ATTENDED") {
      return NextResponse.json(
        { error: "You already attended — thank you. The record stands." },
        { status: 400 },
      );
    }
    await prisma.eventRSVP.update({
      where: { id: existing.id },
      data: { status: "CANCELLED" },
    });
    // Reopen the event if it had filled
    const confirmed = await prisma.eventRSVP.count({
      where: { eventId: id, status: { in: ["CONFIRMED", "ATTENDED"] } },
    });
    if (event.status === "FULL" && confirmed < event.capacity) {
      await prisma.restorationEvent.update({ where: { id }, data: { status: "OPEN" } });
    }
    return NextResponse.json({ rsvp: false, confirmedCount: confirmed });
  }

  // join
  if (existing?.status === "CONFIRMED" || existing?.status === "ATTENDED") {
    return NextResponse.json({ error: "You're already on the list." }, { status: 400 });
  }

  const confirmed = event.rsvps.length;
  if (event.status === "FULL" || confirmed >= event.capacity) {
    return NextResponse.json({ error: "This event is full." }, { status: 409 });
  }

  if (existing?.status === "CANCELLED") {
    await prisma.eventRSVP.update({ where: { id: existing.id }, data: { status: "CONFIRMED" } });
  } else {
    await prisma.eventRSVP.create({
      data: { eventId: id, userId: session.user.id, status: "CONFIRMED" },
    });
  }

  const newCount = confirmed + 1;
  if (newCount >= event.capacity) {
    await prisma.restorationEvent.update({ where: { id }, data: { status: "FULL" } });
  }

  return NextResponse.json({ rsvp: true, confirmedCount: newCount });
}