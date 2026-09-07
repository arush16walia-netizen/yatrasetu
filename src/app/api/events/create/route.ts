import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { deriveCheckinCode } from "@/lib/checkin";

const DIFFICULTIES = new Set(["EASY", "MODERATE", "HARD"]);

// Community leads create restoration events. Leader status is validated
// server-side — never trusted from the client.

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in to create events." }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { isOrganizer: true, role: true, communityApplication: { select: { status: true } } },
  });
  const isLeader =
    user?.role === "ADMIN" ||
    user?.isOrganizer ||
    user?.communityApplication?.status === "APPROVED";
  if (!isLeader) {
    return NextResponse.json(
      { error: "Only verified community leads can create events. Apply at /community-apply." },
      { status: 403 },
    );
  }

  let body: {
    title?: string;
    destinationSlug?: string;
    description?: string;
    date?: string;
    startTime?: string;
    endTime?: string;
    meetingPoint?: string;
    capacity?: number;
    whatToBring?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const title = body.title?.trim() ?? "";
  const destinationSlug = body.destinationSlug?.trim() ?? "";
  const description = body.description?.trim() ?? "";
  const startTime = body.startTime?.trim() ?? "";
  const endTime = body.endTime?.trim() || null;
  const meetingPoint = body.meetingPoint?.trim() ?? "";
  const whatToBring = body.whatToBring?.trim() || "Gloves, bags and tools are provided — bring water.";
  const capacity = Number(body.capacity);

  if (title.length < 4) {
    return NextResponse.json({ error: "Give the event a real name." }, { status: 422 });
  }
  if (description.length < 20) {
    return NextResponse.json({ error: "Describe the work in at least a sentence or two." }, { status: 422 });
  }
  if (!destinationSlug) {
    return NextResponse.json({ error: "Choose the destination this event serves." }, { status: 422 });
  }
  const date = new Date(body.date ?? "");
  if (Number.isNaN(date.getTime()) || date < new Date()) {
    return NextResponse.json({ error: "Pick a future date." }, { status: 422 });
  }
  if (!/^\d{2}:\d{2}$/.test(startTime)) {
    return NextResponse.json({ error: "Start time must be HH:MM." }, { status: 422 });
  }
  if (endTime && !/^\d{2}:\d{2}$/.test(endTime)) {
    return NextResponse.json({ error: "End time must be HH:MM." }, { status: 422 });
  }
  if (meetingPoint.length < 4) {
    return NextResponse.json({ error: "Where will the crew meet?" }, { status: 422 });
  }
  if (!Number.isInteger(capacity) || capacity < 5 || capacity > 500) {
    return NextResponse.json({ error: "Capacity must be between 5 and 500." }, { status: 422 });
  }

  const destination = await prisma.destination.findUnique({ where: { slug: destinationSlug } });
  if (!destination) {
    return NextResponse.json({ error: "That destination isn't in the ledger." }, { status: 404 });
  }

  // Unique slug from the title; suffix on collision.
  const base = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  let slug = base;
  let n = 1;
  while (await prisma.restorationEvent.findUnique({ where: { slug } })) {
    slug = `${base}-${++n}`;
  }

  const event = await prisma.restorationEvent.create({
    data: {
      title,
      slug,
      destinationId: destination.id,
      date,
      startTime,
      endTime,
      meetingPoint,
      description,
      whatToBring,
      capacity,
      organizerName: `${session.user.name ?? "A community lead"} · verified lead`,
      organizerId: session.user.id,
      image: destination.image,
      status: "OPEN",
      checkinCode: deriveCheckinCode(slug, title),
    },
    select: { slug: true, title: true },
  });

  return NextResponse.json({ event }, { status: 201 });
}
