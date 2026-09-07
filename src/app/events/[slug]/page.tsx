import Image from "@/components/ui/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  ArrowLeft,
  ArrowUpRight,
  Backpack,
  CalendarDays,
  Clock3,
  HandHeart,
  MapPin,
  UserRound,
} from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { Badge } from "@/components/ui/badge";
import { RsvpPanel } from "@/components/events/rsvp-panel";
import { EventWeather } from "@/components/weather/event-weather";
import { getEventBySlug, getUpcomingEvents } from "@/lib/queries";
import { formatDate } from "@/lib/utils";

export const dynamicParams = true;

export async function generateStaticParams() {
  const events = await getUpcomingEvents(100);
  return events.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) return { title: "Event not found" };
  return {
    title: event.title,
    description: event.description.slice(0, 160),
  };
}

export default async function EventPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [event, session] = await Promise.all([getEventBySlug(slug), auth()]);

  if (!event) notFound();

  // Current user's RSVP state
  let myRsvp: "CONFIRMED" | "ATTENDED" | "CANCELLED" | null = null;
  if (session?.user?.id) {
    const mine = await prisma.eventRSVP.findUnique({
      where: { eventId_userId: { eventId: event.id, userId: session.user.id } },
    });
    myRsvp = mine?.status === "CONFIRMED" || mine?.status === "ATTENDED" ? mine.status : null;
  }

  const spotsLeft = event.capacity - event.confirmedCount;
  const whatToBring = event.whatToBring.split(/[,;]+/).map((s) => s.trim()).filter(Boolean);
  const [lat, lng] = (event.destination.coordinates ?? ",").split(",").map(Number);

  return (
    <>
      {/* Hero */}
      <section className="relative flex min-h-[72svh] items-end overflow-hidden bg-ink pb-14 pt-40 text-paper">
        <div className="absolute inset-0" aria-hidden>
          <Image
            src={event.image}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/50 to-ink/15" />
        </div>
        <Container className="relative">
          <Reveal>
            <Link
              href="/events"
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-paper/60 transition-colors hover:text-paper"
            >
              <ArrowLeft className="size-3.5" aria-hidden />
              All restoration events
            </Link>
          </Reveal>
          <Reveal delay={0.08}>
            <div className="mt-6 flex flex-wrap items-center gap-2">
              <Badge tone="verify">Restoration event</Badge>
              <span className="text-xs font-medium uppercase tracking-wider text-paper/60">
                {event.destination.name} · {event.destination.region}
              </span>
            </div>
          </Reveal>
          <Reveal delay={0.14}>
            <h1 className="mt-5 max-w-4xl font-display text-[clamp(2.4rem,6vw,5.5rem)] font-medium leading-[1.02] tracking-tight text-balance">
              {event.title}
            </h1>
          </Reveal>
          <Reveal delay={0.22}>
            <div className="mt-7 flex flex-wrap items-center gap-x-7 gap-y-3 text-sm text-paper/85">
              <span className="flex items-center gap-2">
                <CalendarDays className="size-4 text-saffron" aria-hidden />
                {formatDate(event.date)}
              </span>
              <span className="flex items-center gap-2">
                <Clock3 className="size-4 text-saffron" aria-hidden />
                {event.startTime}
                {event.endTime ? ` – ${event.endTime}` : ""}
              </span>
              <span className="flex items-center gap-2">
                <MapPin className="size-4 text-saffron" aria-hidden />
                {event.meetingPoint}
              </span>
            </div>
          </Reveal>
        </Container>
      </section>

      {/* Body */}
      <section className="bg-paper py-20 sm:py-24">
        <Container className="grid gap-12 lg:grid-cols-12">
          {/* Main column */}
          <div className="lg:col-span-7">
            <Reveal>
              <h2 className="font-display text-3xl tracking-tight text-ink sm:text-4xl">
                What you&rsquo;ll actually do
              </h2>
              <p className="mt-5 text-lg leading-relaxed text-stone">{event.description}</p>
            </Reveal>

            <Reveal delay={0.1}>
              <div className="mt-10 grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg border border-ink/8 bg-paper-raised p-6 shadow-card">
                  <MapPin className="size-5 text-saffron-deep" aria-hidden />
                  <h3 className="mt-3 font-display text-lg tracking-tight text-ink">Meeting point</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-stone">{event.meetingPoint}</p>
                </div>
                <div className="rounded-lg border border-ink/8 bg-paper-raised p-6 shadow-card">
                  <UserRound className="size-5 text-saffron-deep" aria-hidden />
                  <h3 className="mt-3 font-display text-lg tracking-tight text-ink">Organised by</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-stone">{event.organizerName}</p>
                </div>
              </div>
            </Reveal>

            <Reveal delay={0.16}>
              <div className="mt-6 rounded-lg border border-ink/8 bg-paper-raised p-6 shadow-card">
                <Backpack className="size-5 text-saffron-deep" aria-hidden />
                <h3 className="mt-3 font-display text-lg tracking-tight text-ink">What to bring</h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {whatToBring.map((item) => (
                    <span
                      key={item}
                      className="rounded-sm border border-ink/10 bg-paper px-3 py-1 text-xs font-medium text-stone"
                    >
                      {item}
                    </span>
                  ))}
                </div>
                <p className="mt-3 text-xs text-stone">
                  Gloves, bags and tools are provided by the organisers. Just bring yourself and water.
                </p>
              </div>
            </Reveal>

            <Reveal delay={0.2}>
              <div className="mt-6 rounded-lg border border-verify/25 bg-verify/8 p-6">
                <div className="flex items-start gap-3">
                  <HandHeart className="mt-0.5 size-5 shrink-0 text-verify" aria-hidden />
                  <div>
                    <h3 className="font-display text-lg tracking-tight text-verify">
                      Why verify with a QR?
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-verify/90">
                      When you arrive, scan the event QR at the site. Your check-in is timestamped
                      and geo-verified — turning your RSVP into a permanent, provable contribution
                      that earns a stamp in your Yatra Passport. No honour-system. Just proof.
                    </p>
                  </div>
                </div>
              </div>
            </Reveal>

            <Reveal delay={0.24}>
              <div className="mt-8 flex flex-wrap gap-x-7 gap-y-3">
                <Link
                  href={`/explore/${event.destination.slug}`}
                  className="group inline-flex items-center gap-1.5 text-sm font-semibold text-saffron-deep hover:underline"
                >
                  Visit {event.destination.name}
                  <ArrowUpRight className="size-4" aria-hidden />
                </Link>
                <Link
                  href={`/events/${event.slug}/board`}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-stone hover:underline hover:text-ink"
                >
                  Organiser board <span className="text-xs text-stone/50">(QR to display)</span>
                  <ArrowUpRight className="size-4" aria-hidden />
                </Link>
              </div>
            </Reveal>
          </div>

          {/* RSVP rail */}
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-28">
              {Number.isFinite(lat) && Number.isFinite(lng) && (
                <Reveal delay={0.05}>
                  <EventWeather lat={lat} lng={lng} eventDate={event.date} />
                </Reveal>
              )}
              <Reveal delay={0.1}>
                <RsvpPanel
                  eventId={event.id}
                  eventSlug={event.slug}
                  capacity={event.capacity}
                  confirmedCount={event.confirmedCount}
                  status={event.status}
                  eventDate={event.date}
                  signedIn={Boolean(session?.user)}
                  initialRsvp={myRsvp}
                />
              </Reveal>
              <Reveal delay={0.2}>
                <div className="mt-4 rounded-lg border border-dashed border-ink/15 p-5 text-center">
                  <p className="font-deva text-sm text-stone">स्थान भरता है, यात्रा नहीं भरती।</p>
                  <p className="mt-1 text-xs text-stone">
                    {spotsLeft > 0
                      ? spotsLeft === event.capacity
                        ? `All ${event.capacity} spots open — a small crew keeps the work meaningful.`
                        : `${spotsLeft} of ${event.capacity} spots left — a small crew keeps the work meaningful.`
                      : "This crew is full — another seva is always opening."}
                  </p>
                </div>
              </Reveal>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}