import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { LITTER_CATEGORIES, LITTER_VOLUMES } from "@/lib/litter";

const CATEGORY_KEYS = new Set<string>(LITTER_CATEGORIES.map((c) => c.key));
const VOLUME_KEYS = new Set<string>(LITTER_VOLUMES.map((v) => v.key));
const KARMA_PER_REPORT = 50;

/**
 * Swachh Yatra reporter: a verified cleanup ticket for a remote trail.
 * Signed-in reporters earn +50 service points; the ticket joins the live feed
 * for local crews. Anonymous submission is not accepted — karma must be
 * attributable.
 */
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in to report — the +50 karma needs an account." }, { status: 401 });
  }

  let body: {
    spotName?: string;
    region?: string;
    category?: string;
    volume?: string;
    description?: string;
    latitude?: number | null;
    longitude?: number | null;
    hasPhoto?: boolean;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const spotName = body.spotName?.trim() ?? "";
  const category = body.category?.toUpperCase() ?? "";
  const volume = body.volume?.toUpperCase() ?? "";

  if (spotName.length < 4) {
    return NextResponse.json({ error: "Name the spot (trail name, landmark, km marker…)." }, { status: 422 });
  }
  if (!CATEGORY_KEYS.has(category)) {
    return NextResponse.json({ error: "Pick a waste category." }, { status: 422 });
  }
  if (!VOLUME_KEYS.has(volume)) {
    return NextResponse.json({ error: "Estimate the volume." }, { status: 422 });
  }
  if (
    body.latitude != null &&
    (!Number.isFinite(body.latitude) || Math.abs(body.latitude) > 90)
  ) {
    return NextResponse.json({ error: "Those GPS coordinates don't look valid." }, { status: 422 });
  }

  const ticketCode = `SW-${new Date().getFullYear()}-${Math.random()
    .toString(36)
    .slice(2, 6)
    .toUpperCase()}`;

  const result = await prisma.$transaction(async (tx) => {
    const report = await tx.litterReport.create({
      data: {
        ticketCode,
        userId: session.user.id,
        spotName,
        region: body.region?.trim() || null,
        category,
        volume,
        description: body.description?.trim() || null,
        latitude: typeof body.latitude === "number" ? body.latitude : null,
        longitude: typeof body.longitude === "number" ? body.longitude : null,
        hasPhoto: Boolean(body.hasPhoto),
        status: "DISPATCHED",
      },
    });

    await tx.user.update({
      where: { id: session.user.id },
      data: { points: { increment: KARMA_PER_REPORT } },
    });

    return report;
  });

  return NextResponse.json(
    { ticketCode: result.ticketCode, pointsAwarded: KARMA_PER_REPORT },
    { status: 201 },
  );
}
