import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { addPlanItem, getOrCreatePlan, removePlanItem, reorderPlanItems } from "@/lib/itineraries";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in to plan your Yatra." }, { status: 401 });
  }
  const plan = await getOrCreatePlan(session.user.id);
  return NextResponse.json(plan);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in to plan your Yatra." }, { status: 401 });
  }

  let body: { destinationId?: string; eventId?: string; day?: number; note?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const result = await addPlanItem(session.user.id, body);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  return NextResponse.json(result, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in to edit your Yatra." }, { status: 401 });
  }
  const itemId = request.nextUrl.searchParams.get("itemId");
  if (!itemId) {
    return NextResponse.json({ error: "Missing itemId." }, { status: 422 });
  }
  const result = await removePlanItem(session.user.id, itemId);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  return NextResponse.json({ ok: true });
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in to edit your Yatra." }, { status: 401 });
  }

  let body: { orderedIds?: string[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const result = await reorderPlanItems(session.user.id, body.orderedIds ?? []);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  return NextResponse.json({ ok: true });
}
