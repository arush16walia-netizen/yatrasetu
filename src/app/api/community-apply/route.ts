import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const AFFILIATIONS = new Set(["NGO", "MUNICIPAL", "COLLEGE", "TOURISM"]);

// Community Lead application — persisted to the DB with a real review status.
// The original repo faked the submit with setTimeout; here an application is a
// real record, unique per user, and re-submission updates a rejected one.

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in to view your application." }, { status: 401 });
  }
  const application = await prisma.communityApplication.findUnique({
    where: { userId: session.user.id },
    select: { affiliation: true, orgName: true, status: true, createdAt: true, reviewedAt: true },
  });
  return NextResponse.json({ application });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in to apply." }, { status: 401 });
  }

  let body: { affiliation?: string; orgName?: string; contactEmail?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const affiliation = body.affiliation?.trim().toUpperCase() ?? "";
  const orgName = body.orgName?.trim() ?? "";
  const contactEmail = body.contactEmail?.trim() || null;

  if (!AFFILIATIONS.has(affiliation)) {
    return NextResponse.json(
      { error: "Choose an affiliation: NGO, Municipal, College or Tourism." },
      { status: 422 },
    );
  }
  if (orgName.length < 3) {
    return NextResponse.json(
      { error: "Enter the organisation or body name." },
      { status: 422 },
    );
  }

  const data = { affiliation, orgName, contactEmail };

  // Upsert: a rejected application can be re-submitted for review.
  const application = await prisma.communityApplication.upsert({
    where: { userId: session.user.id },
    create: { ...data, userId: session.user.id },
    update: { ...data, status: "PENDING", reviewedAt: null },
    select: { affiliation: true, orgName: true, status: true, createdAt: true },
  });

  return NextResponse.json({ application }, { status: 201 });
}
