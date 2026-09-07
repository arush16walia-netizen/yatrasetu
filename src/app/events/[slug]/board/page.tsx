import { redirect, notFound } from "next/navigation";
import { toDataURL } from "qrcode";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, QrCode } from "lucide-react";
import { auth } from "@/auth";
import { Container } from "@/components/ui/container";
import { getEventBySlug } from "@/lib/queries";
import { formatDate } from "@/lib/utils";

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
  const checkinUrl = `${origin}/events/${event.slug}/check-in?code=${encodeURIComponent(event.checkinCode ?? "")}`;
  const qr = await toDataURL(checkinUrl, {
    margin: 1,
    width: 560,
    color: { dark: "#0B0F17", light: "#FFFFFF" },
  });

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

          <div className="mx-auto mt-10 w-fit rounded-lg bg-paper p-6 shadow-lift">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qr} alt={`QR code for checking in to ${event.title}`} width={320} height={320} className="size-64 rounded-md" />
          </div>

          <p className="mt-6 text-xs uppercase tracking-[0.2em] text-stone">Or the code is</p>
          <p className="mt-2 font-mono text-4xl font-bold tracking-[0.25em] text-ink">
            {event.checkinCode}
          </p>
          <p className="mt-3 font-deva text-sm text-stone">
            Participants scan or type this at the site — check-in is verified and stamped.
          </p>
        </div>

        <p className="mt-6 text-center text-xs text-paper/40">
          Board auto-refreshes per event · participants must RSVP and be present to verify
        </p>
      </Container>
    </section>
  );
}