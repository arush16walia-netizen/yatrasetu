import Image from "@/components/ui/image";
import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowUpRight,
  CalendarDays,
  Clock3,
  MapPin,
  Sparkles,
  Users,
} from "lucide-react";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { Badge } from "@/components/ui/badge";
import { getUpcomingEvents } from "@/lib/queries";
import { formatDate, formatDay } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Restoration events",
  description:
    "Places that need you. RSVP to restoration events across India, show up, scan, get verified — and earn stamps.",
};

function StatusBadge({ status, spotsLeft }: { status: string; spotsLeft: number }) {
  if (status === "FULL" || spotsLeft <= 0) return <Badge tone="ember">Full</Badge>;
  if (status === "CANCELLED") return <Badge tone="neutral">Cancelled</Badge>;
  if (status === "COMPLETED") return <Badge tone="neutral">Completed</Badge>;
  return <Badge tone="verify">Places needed</Badge>;
}

export default async function EventsPage() {
  const events = await getUpcomingEvents();

  return (
    <>
      {/* Hero */}
      <section className="relative flex min-h-[64svh] items-end overflow-hidden bg-ink pb-14 pt-44 text-paper">
        <div className="absolute inset-0" aria-hidden>
          <Image
            src="https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=2400&auto=format&fit=crop"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-55"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/75 to-ink/30" />
        </div>
        <Container className="relative">
          <Reveal>
            <p className="eyebrow flex items-center gap-3 text-saffron">
              <span className="h-px w-10 bg-saffron/70" aria-hidden />
              Restoration events
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <h1 className="mt-6 max-w-4xl font-display text-[clamp(2.8rem,7vw,6.5rem)] font-medium leading-[0.98] tracking-tight">
              Places that need you.
            </h1>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-paper/80">
              Locals and verified community leads open these events. You RSVP, you arrive, you
              scan the QR at the site — and your hour becomes a place&rsquo;s story. {events.length} events
              are open right now.
            </p>
          </Reveal>
          <Reveal delay={0.3}>
            <div className="mt-8 flex flex-wrap gap-3 text-sm text-paper/70">
              <span className="inline-flex items-center gap-2">
                <CalendarDays className="size-4 text-saffron" aria-hidden />
                Oct – Nov 2026
              </span>
              <span className="inline-flex items-center gap-2">
                <MapPin className="size-4 text-saffron" aria-hidden />
                11 destinations
              </span>
              <span className="inline-flex items-center gap-2">
                <Sparkles className="size-4 text-saffron" aria-hidden />
                Every RSVP earns a stamp after verified check-in
              </span>
            </div>
          </Reveal>
        </Container>
      </section>

      {/* List */}
      <section className="bg-paper py-20 sm:py-28">
        <Container className="max-w-5xl">
          <Reveal>
            <div className="flex items-end justify-between gap-6">
              <div>
                <p className="eyebrow text-saffron-deep">Upcoming</p>
                <h2 className="mt-3 font-display text-3xl tracking-tight text-ink sm:text-4xl">
                  Choose your seva
                </h2>
              </div>
              <p className="hidden text-sm text-stone sm:block">
                Sorted by date — earliest first
              </p>
            </div>
          </Reveal>

          <div className="mt-10 space-y-5">
            {events.map((event, i) => {
              const spotsLeft = event.capacity - event.confirmedCount;
              return (
                <Reveal key={event.id} delay={Math.min(i * 0.05, 0.3)}>
                  <Link
                    href={`/events/${event.slug}`}
                    className="group grid gap-0 overflow-hidden rounded-lg border border-ink/8 bg-paper-raised shadow-card transition-colors duration-300 hover:border-saffron/40 hover:shadow-lift sm:grid-cols-[110px_1fr_auto]"
                  >
                    {/* date */}
                    <div className="flex items-center gap-4 border-b border-ink/8 bg-ink px-6 py-5 text-paper sm:flex-col sm:justify-center sm:gap-0 sm:border-b-0 sm:px-4 sm:py-6">
                      <p className="font-display text-3xl font-semibold leading-none sm:text-4xl">
                        {formatDay(event.date).split(" ")[0]}
                      </p>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-saffron">
                          {formatDay(event.date).split(" ")[1]}
                        </p>
                        <p className="mt-1 text-[11px] text-paper/50">
                          {event.date.toLocaleDateString("en-IN", { weekday: "short" })}
                        </p>
                      </div>
                    </div>

                    {/* body */}
                    <div className="flex min-w-0 items-center gap-5 p-6">
                      <div className="relative hidden size-20 shrink-0 overflow-hidden rounded-md md:block">
                        <Image
                          src={event.image}
                          alt=""
                          fill
                          sizes="80px"
                          className="object-cover transition-transform duration-700 ease-expo group-hover:scale-110"
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <StatusBadge status={event.status} spotsLeft={spotsLeft} />
                          <span className="text-xs font-medium uppercase tracking-wider text-stone">
                            {event.destination.name} · {event.destination.region}
                          </span>
                        </div>
                        <h3 className="mt-2 truncate font-display text-xl tracking-tight text-ink sm:text-2xl">
                          {event.title}
                        </h3>
                        <p className="mt-1.5 flex items-center gap-2 text-sm text-stone">
                          <Clock3 className="size-3.5 shrink-0 text-saffron-deep" aria-hidden />
                          <span className="truncate">
                            {event.startTime}
                            {event.endTime ? ` – ${event.endTime}` : ""} · {event.meetingPoint}
                          </span>
                        </p>
                      </div>
                    </div>

                    {/* meta */}
                    <div className="flex items-center justify-between gap-4 border-t border-ink/8 px-6 py-4 sm:w-52 sm:flex-col sm:items-end sm:justify-center sm:border-l sm:border-t-0 sm:py-6">
                      <p className="flex items-center gap-1.5 text-sm text-stone">
                        <Users className="size-4 text-saffron-deep" aria-hidden />
                        {event.confirmedCount} going · {spotsLeft > 0 ? `${spotsLeft} spots` : "full"}
                      </p>
                      <span className="inline-flex items-center gap-1 text-sm font-bold text-ink transition-colors group-hover:text-saffron-deep">
                        View event
                        <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </span>
                    </div>
                  </Link>
                </Reveal>
              );
            })}
          </div>

          <Reveal delay={0.15}>
            <p className="mt-12 text-center text-sm leading-relaxed text-stone">
              All events are organised with local communities. Attending is free —
              <span className="font-semibold text-ink"> your presence is the contribution.</span>
            </p>
          </Reveal>
        </Container>
      </section>
    </>
  );
}