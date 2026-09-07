import { redirect, notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, QrCode } from "lucide-react";
import { auth } from "@/auth";
import { Container } from "@/components/ui/container";
import { getEventBySlug } from "@/lib/queries";
import { formatDate } from "@/lib/utils";
import { RotatingBoard } from "@/components/checkin/rotating-board";

export const metadata: Metadata = { title: "Event board" };

export default async function BoardPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect(`/login?next=/events/${slug}/board`);

  const event = await getEventBySlug(slug);
  if (!event) notFound();

  const origin =
    process.env.NEXTAUTH_URL?.replace(/\/$/, "") ??
    "https://yatrasetu.in";

  return (
    <section className="min-h-[100svh] bg-ink pt-32 pb-24 text-paper">
      <Container className="max-w-2xl">
        <Link
          href={`/events/${event.slug}`}
          className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-paper/50 transition-colors hover:text-paper"
        >
          <ArrowLeft className="size-3.5" aria-hidden />
          Back to event
        </Link>

        <div className="mt-8 rounded-lg bg-paper-raised p-8 text-center text-ink shadow-lift sm:p-12">
          <p className="eyebrow flex items-center justify-center gap-2 text-saffron-deep">
            <QrCode className="size-4" aria-hidden />
            Event board · show at the meeting point
          </p>
          <h1 className="mt-4 font-display text-4xl tracking-tight sm:text-5xl">{event.title}</h1>
          <p className="mt-2 text-sm text-stone">
            {event.destination.name} · {formatDate(event.date)} · {event.startTime}
            {event.endTime ? ` – ${event.endTime}` : ""}
          </p>

          <div className="mt-10">
            <RotatingBoard
              eventId={event.id}
              eventSlug={event.slug}
              eventTitle={event.title}
              staticCode={event.checkinCode ?? ""}
              origin={origin}
            />
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-paper/40">
          Zero-proxy: the token rotates every 15 seconds · participants must RSVP and be present to verify
        </p>
      </Container>
    </section>
  );
}