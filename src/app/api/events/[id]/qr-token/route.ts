import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { currentRotatingToken, windowRemaining } from "@/lib/rotating-token";

/**
 * Fresh rotating token for an event's board QR. The board polls this every
 * 15 seconds; a token screenshot forwarded elsewhere expires with its window.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in to view the board." }, { status: 401 });
  }

  const { id } = await params;
  const event = await prisma.restorationEvent.findUnique({
    where: { id },
    select: { checkinCode: true, status: true },
  });

  if (!event || !event.checkinCode) {
    return NextResponse.json({ error: "Event not found." }, { status: 404 });
  }

  return NextResponse.json(
    { token: currentRotatingToken(event.checkinCode), expiresIn: windowRemaining() },
    { headers: { "Cache-Control": "no-store" } },
  );
}
