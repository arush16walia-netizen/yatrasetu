import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { awardStamps, checkinWindowOpen, geofenceVerdict, parseCoordinates, GEOFENCE_METERS } from "@/lib/checkin";
import { verifyRotatingToken } from "@/lib/rotating-token";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in to check in." }, { status: 401 });
  }

  const { id } = await params;

  let body: { code?: string; latitude?: number | null; longitude?: number | null; accuracy?: number | null };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const code = body.code?.trim().toUpperCase() ?? "";
  if (!code) {
    return NextResponse.json({ error: "Enter the check-in code from the site." }, { status: 422 });
  }

  const event = await prisma.restorationEvent.findUnique({
    where: { id },
    include: {
      destination: { select: { slug: true, name: true, coordinates: true } },
      rsvps: {
        where: { userId: session.user.id },
        select: { id: true, status: true },
      },
    },
  });

  if (!event) {
    return NextResponse.json({ error: "Event not found." }, { status: 404 });
  }

  if (!checkinWindowOpen(event.date)) {
    return NextResponse.json(
      { error: "Check-in opens on the event day and closes 24 hours after." },
      { status: 403 },
    );
  }

  if (event.status === "CANCELLED") {
    return NextResponse.json({ error: "This event was cancelled." }, { status: 400 });
  }

  const myRsvp = event.rsvps[0];
  if (!myRsvp || myRsvp.status === "CANCELLED") {
    return NextResponse.json(
      { error: "You need to RSVP before you can check in." },
      { status: 403 },
    );
  }
  if (myRsvp.status === "ATTENDED") {
    return NextResponse.json(
      { error: "You've already checked in to this event — thank you!" },
      { status: 409 },
    );
  }

  // Two valid formats:
  //   "CODE.TOKEN" — zero-proxy rotating QR (token expires every 15 seconds)
  //   "CODE"       — the static printed code (fallback; visible only on the board)
  let method = "code";
  const [staticPart, tokenPart] = code.split(".");
  if (!event.checkinCode || staticPart.toUpperCase() !== event.checkinCode.toUpperCase()) {
    return NextResponse.json(
      { error: "That code doesn't match this event. Check the board at the meeting point." },
      { status: 403 },
    );
  }
  if (tokenPart) {
    if (!verifyRotatingToken(event.checkinCode, tokenPart)) {
      return NextResponse.json(
        { error: "That rotating token has expired — screenshots don't count. Refresh the board at the site and scan again." },
        { status: 403 },
      );
    }
    method = "rotating-qr";
  }

  // Optional client geo. When both the device and the site report a position,
  // the 200m geofence is enforced server-side; denied/unavailable location is
  // accepted but recorded unverified (inside === null), never faked.
  const device =
    typeof body.latitude === "number" && Number.isFinite(body.latitude) &&
    typeof body.longitude === "number" && Number.isFinite(body.longitude)
      ? { lat: body.latitude, lng: body.longitude }
      : null;
  const site = parseCoordinates(event.destination.coordinates);
  const geo = geofenceVerdict(device, site);
  if (geo.inside === false) {
    const km = ((geo.distanceMeters ?? 0) / 1000).toFixed(1);
    return NextResponse.json(
      { error: `You're ${km} km from the meeting point — check-in needs you within ${GEOFENCE_METERS} m of the site.` },
      { status: 403 },
    );
  }
  const lat = device?.lat ?? null;
  const lng = device?.lng ?? null;
  const accuracy = typeof body.accuracy === "number" && Number.isFinite(body.accuracy) ? body.accuracy : null;

  // Prior verified count decides Rakshak (first) / Setu (third) milestone stamps
  const priorAttendanceCount = await prisma.attendanceRecord.count({
    where: { userId: session.user.id },
  });

  // Attendance, points and stamps commit or fail together — one transaction
  // owns the whole check-in mutation.
  const { record: attendance, stamps } = await prisma.$transaction(async (tx) => {
    await tx.eventRSVP.update({ where: { id: myRsvp.id }, data: { status: "ATTENDED" } });

    const record = await tx.attendanceRecord.create({
      data: {
        rsvpId: myRsvp.id,
        userId: session.user.id,
        verifiedAt: new Date(),
        latitude: lat,
        longitude: lng,
        geoAccuracy: accuracy,
        method,
        token: code,
      },
    });

    // Service points ride the same transaction as the attendance record —
    // a partial check-in state (record without points) cannot occur.
    await tx.user.update({
      where: { id: session.user.id },
      data: { points: { increment: 100 } },
    });

    const stamps = await awardStamps(
      tx,
      session.user.id,
      event.destination.slug,
      event.startTime,
      priorAttendanceCount,
    );

    return { record, stamps };
  });

  return NextResponse.json({
    attendance: {
      id: attendance.id,
      verifiedAt: attendance.verifiedAt,
      latitude: attendance.latitude,
      longitude: attendance.longitude,
      geoAccuracy: attendance.geoAccuracy,
      method: attendance.method,
      geoVerified: geo.inside === true,
      distanceMeters: geo.distanceMeters,
    },
    eventTitle: event.title,
    destinationName: event.destination.name,
    pointsAwarded: 100,
    stamps,
  });
}