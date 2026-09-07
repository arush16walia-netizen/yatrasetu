import { redirect, notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Container } from "@/components/ui/container";
import { CheckinFlow } from "@/components/checkin/checkin-flow";
import { getEventBySlug } from "@/lib/queries";

export const metadata: Metadata = { title: "Check in — verify your contribution" };

export default async function CheckinPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect(`/login?next=/events/${slug}/check-in`);

  const event = await getEventBySlug(slug);
  if (!event) notFound();

  const mine = await prisma.eventRSVP.findUnique({
    where: { eventId_userId: { eventId: event.id, userId: session.user.id } },
    select: { status: true },
  });

  return (
    <section className="min-h-[100svh] bg-paper-soft pt-36 pb-24">
      <Container>
        <Link
          href={`/events/${event.slug}`}
          className="mx-auto mb-8 flex w-fit items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-stone transition-colors hover:text-ink"
        >
          <ArrowLeft className="size-3.5" aria-hidden />
          Back to event
        </Link>
        <CheckinFlow
          eventId={event.id}
          eventSlug={event.slug}
          eventTitle={event.title}
          destinationName={event.destination.name}
          rsvpState={mine?.status === "CONFIRMED" || mine?.status === "ATTENDED" ? mine.status : null}
        />
      </Container>
    </section>
  );
}