import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const CATEGORIES = new Set(["OVERCROWDING", "WASTE", "DAMAGE"]);

// "Trending spot alert" — crowd/pressure reports from travellers.
// The original repo faked the submit and hardcoded the alert list; here reports
// are real DB records and the board shows genuine submissions.

export async function GET(request: NextRequest) {
  const status = request.nextUrl.searchParams.get("status");
  const reports = await prisma.spotReport.findMany({
    where: status ? { status: status.toUpperCase() } : undefined,
    orderBy: { createdAt: "desc" },
    take: 40,
    include: { user: { select: { name: true } } },
  });
  return NextResponse.json({
    reports: reports.map((r) => ({
      id: r.id,
      spotName: r.spotName,
      region: r.region,
      category: r.category,
      description: r.description,
      status: r.status,
      createdAt: r.createdAt,
      reporter: r.user?.name ?? "A traveller",
    })),
  });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in to file an alert." }, { status: 401 });
  }

  let body: { spotName?: string; region?: string; category?: string; description?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const spotName = body.spotName?.trim() ?? "";
  const region = body.region?.trim() || null;
  const category = body.category?.trim().toUpperCase() ?? "";
  const description = body.description?.trim() || null;

  if (spotName.length < 2) {
    return NextResponse.json({ error: "Name the spot you're reporting." }, { status: 422 });
  }
  if (!CATEGORIES.has(category)) {
    return NextResponse.json(
      { error: "Pick a category: overcrowding, waste or damage." },
      { status: 422 },
    );
  }

  const report = await prisma.spotReport.create({
    data: {
      userId: session.user.id,
      spotName,
      region,
      category,
      description,
    },
    select: { id: true, spotName: true, category: true, status: true, createdAt: true },
  });

  return NextResponse.json({ report }, { status: 201 });
}
