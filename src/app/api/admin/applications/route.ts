import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// Admin-only: review community-lead applications. Role is read from the DB,
// never from the client.

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) return null;
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });
  return user?.role === "ADMIN" ? session : null;
}

export async function GET() {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Admins only." }, { status: 403 });
  }
  const applications = await prisma.communityApplication.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: { select: { name: true, email: true } } },
  });
  return NextResponse.json({ applications });
}

export async function PATCH(request: Request) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Admins only." }, { status: 403 });
  }

  let body: { applicationId?: string; decision?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const decision = body.decision?.toUpperCase();
  if (!body.applicationId || !decision || !["APPROVED", "REJECTED"].includes(decision)) {
    return NextResponse.json({ error: "Provide applicationId and decision (APPROVED/REJECTED)." }, { status: 422 });
  }

  const application = await prisma.communityApplication.findUnique({
    where: { id: body.applicationId },
    include: { user: { select: { id: true } } },
  });
  if (!application) {
    return NextResponse.json({ error: "Application not found." }, { status: 404 });
  }

  const updated = await prisma.communityApplication.update({
    where: { id: body.applicationId },
    data: { status: decision, reviewedAt: new Date() },
  });

  // Approving grants leader powers on the user record.
  if (decision === "APPROVED") {
    await prisma.user.update({
      where: { id: application.user.id },
      data: { isOrganizer: true, role: "LEADER" },
    });
  }

  return NextResponse.json({ application: updated });
}
