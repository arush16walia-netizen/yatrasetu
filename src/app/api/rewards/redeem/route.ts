import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { redeemReward } from "@/lib/rewards";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in to redeem rewards." }, { status: 401 });
  }

  let body: { rewardId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (!body.rewardId) {
    return NextResponse.json({ error: "Choose a reward to redeem." }, { status: 422 });
  }

  const result = await redeemReward(session.user.id, body.rewardId);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  return NextResponse.json(result, { status: 201 });
}
