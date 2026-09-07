import Link from "next/link";
import Image from "@/components/ui/image";
import { ArrowUpRight, CalendarDays, Clock3, MapPin, Users } from "lucide-react";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/ui/reveal";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { formatDay } from "@/lib/utils";
import type { EventSummary } from "@/lib/queries";

function StatusBadge({ status }: { status: string }) {
  if (status === "FULL") return <Badge tone="ember">Full</Badge>;
  if (status === "CANCELLED") return <Badge tone="neutral">Cancelled</Badge>;
  if (status === "COMPLETED") return <Badge tone="neutral">Completed</Badge>;
  return <Badge tone="verify">Places needed</Badge>;
}

export function Events({ events }: { events: EventSummary[] }) {
  if (events.length === 0) return null;

  return (
    <section className="bg-paper-soft py-24 sm:py-32" aria-label="Restoration events">
      <Container>
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            eyebrow="Restoration events"
            title={
              <>
                Real work, real places.
                <br />
                <span className="text-stone italic">Happening on dates you can keep.</span>
              </>
            }
            lede="Locals and verified community leads open these events. You RSVP, you show up, you scan, you're verified — and the place is measurably better."
          />
          <Reveal delay={0.2}>
            <ButtonLink href="/events" variant="outline-dark" size="md" className="shrink-0">
              All events
              <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </ButtonLink>
          </Reveal>
        </div>

        <div className="mt-14 grid gap-5 lg:grid-cols-3">
          {events.slice(0, 3).map((event, i) => {
            const spotsLeft = event.capacity - event.confirmedCount;
            return (
              <Reveal key={event.id} delay={i * 0.12} className="h-full">
                <Link
                  href={`/events/${event.slug}`}
                  className="group flex h-full flex-col overflow-hidden rounded-lg bg-paper-raised shadow-card transition-all duration-500 ease-expo hover:border-saffron/40 hover:shadow-lift"
                >
                  <div className="relative h-52 overflow-hidden">
                    <Image
                      src={event.image}
                      alt={event.title}
                      fill
                      sizes="(max-width: 1024px) 100vw, 33vw"
                      className="object-cover transition-transform duration-[1.4s] ease-expo group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink/70 to-transparent" />
                    <div className="absolute left-4 top-4 flex items-center gap-2">
                      <div className="rounded-md border border-paper/15 bg-ink px-3.5 py-2 text-center">
                        <p className="font-display text-lg font-semibold leading-none text-paper">
                          {formatDay(event.date).split(" ")[0]}
                        </p>
                        <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-widest text-saffron">
                          {formatDay(event.date).split(" ")[1]}
                        </p>
                      </div>
                      <StatusBadge status={event.status} />
                    </div>
                    <div className="absolute bottom-3 left-4 right-4 flex items-center gap-2 text-xs text-paper/85">
                      <MapPin className="size-3.5 shrink-0 text-saffron" aria-hidden />
                      {event.destination.name}
                      {event.destination.region && ` · ${event.destination.region}`}
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col p-6">
                    <h3 className="font-display text-2xl leading-tight tracking-tight text-ink transition-colors duration-300 group-hover:text-saffron-deep">
                      {event.title}
                    </h3>
                    <div className="mt-4 space-y-2 text-sm text-stone">
                      <p className="flex items-center gap-2.5">
                        <Clock3 className="size-4 text-saffron-deep" aria-hidden />
                        {event.startTime}
                        {event.endTime ? ` – ${event.endTime}` : ""} · {event.meetingPoint}
                      </p>
                      <p className="flex items-center gap-2.5">
                        <Users className="size-4 text-saffron-deep" aria-hidden />
                        {event.confirmedCount} travelling · {spotsLeft > 0 ? `${spotsLeft} spots left` : "full"}
                      </p>
                    </div>
                    <div className="mt-5 flex items-center justify-between border-t border-ink/8 pt-4">
                      <p className="text-xs text-stone">{event.organizerName}</p>
                      <span className="inline-flex items-center gap-1 text-sm font-semibold text-ink transition-colors duration-300 group-hover:text-saffron-deep">
                        RSVP
                        <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </span>
                    </div>
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </Container>
    </section>
  );
}