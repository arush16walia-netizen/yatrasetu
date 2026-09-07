import type { Metadata } from "next";
import Link from "next/link";
import { CalendarPlus, Compass, MapPin, Route } from "lucide-react";
import { auth } from "@/auth";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { ButtonLink } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { getOrCreatePlan } from "@/lib/itineraries";
import { responsibleScore } from "@/lib/responsible-score";
import { getDestinations, getUpcomingEvents } from "@/lib/queries";
import { formatDate } from "@/lib/utils";
import { PlanBoard } from "@/components/itinerary/plan-board";
import { AddToPlan } from "@/components/itinerary/add-to-plan";

export const metadata: Metadata = {
  title: "My Yatra",
  description:
    "Build a responsible itinerary: destinations, restoration events, and a Responsible Yatra Score that reflects how lightly you travel.",
};

export const dynamic = "force-dynamic";

export default async function ItineraryPage() {
  const session = await auth();

  if (!session?.user?.id) {
    return (
      <section className="flex min-h-[80vh] flex-col justify-center bg-ink pt-40 text-paper">
        <Container>
          <Reveal>
            <p className="eyebrow text-saffron">My Yatra</p>
          </Reveal>
          <Reveal delay={0.08}>
            <h1 className="mt-5 max-w-3xl font-display text-5xl leading-[1.02] tracking-tight sm:text-6xl">
              Plan the journey.
              <br />
              <span className="text-mist italic">Weave in the seva.</span>
            </h1>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-mist">
              Your itinerary keeps destinations and restoration events on one timeline —
              and scores how responsibly you travel. Sign in to start yours.
            </p>
          </Reveal>
          <Reveal delay={0.24}>
            <div className="mt-10 flex flex-wrap gap-3">
              <ButtonLink href="/login?next=/itinerary" size="lg">
                Sign in to plan
              </ButtonLink>
              <ButtonLink href="/explore" size="lg" variant="outline-light">
                Browse destinations first
              </ButtonLink>
            </div>
          </Reveal>
        </Container>
      </section>
    );
  }

  const [plan, destinations, events] = await Promise.all([
    getOrCreatePlan(session.user.id),
    getDestinations(),
    getUpcomingEvents(12),
  ]);

  const { score, breakdown } = responsibleScore(plan.items);
  const hasEvents = plan.items.some((i) => i.event);

  return (
    <>
      {/* Hero */}
      <section className="relative flex min-h-[52svh] items-end overflow-hidden bg-ink pb-14 pt-44 text-paper">
        <div
          className="absolute inset-0"
          aria-hidden
          style={{
            background:
              "radial-gradient(75% 90% at 15% 0%, rgb(0 77 64 / 0.3), transparent 60%), radial-gradient(55% 70% at 90% 100%, rgb(230 81 0 / 0.14), transparent 65%)",
          }}
        />
        <Container className="relative">
          <Reveal>
            <p className="eyebrow flex items-center gap-3 text-saffron">
              <span className="h-px w-10 bg-saffron/70" aria-hidden />
              My Yatra
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <h1 className="mt-6 max-w-4xl font-display text-[clamp(2.6rem,6vw,5.5rem)] font-medium leading-[0.98] tracking-tight">
              {plan.name}
            </h1>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-paper/75">
              <span className="inline-flex items-center gap-2">
                <MapPin className="size-4 text-saffron" aria-hidden />
                {plan.items.length} stop{plan.items.length === 1 ? "" : "s"}
              </span>
              {plan.startDate && (
                <span className="inline-flex items-center gap-2">
                  <CalendarPlus className="size-4 text-saffron" aria-hidden />
                  from {formatDate(plan.startDate)}
                </span>
              )}
              <span className="inline-flex items-center gap-2">
                <Route className="size-4 text-saffron" aria-hidden />
                {hasEvents ? "Restoration woven in" : "No seva planned yet"}
              </span>
            </p>
          </Reveal>
        </Container>
      </section>

      {/* Score + board */}
      <section className="bg-paper py-16 sm:py-20">
        <Container className="max-w-6xl">
          <div className="grid gap-10 lg:grid-cols-[1fr_340px]">
            {/* The plan board */}
            <div>
              <SectionHeading
                eyebrow="The route"
                title={
                  <>
                    Your days, <span className="text-stone italic">in order.</span>
                  </>
                }
                lede="Drag to reorder within a day — changes save to your record instantly. Reload and it's still here."
              />
              <div className="mt-10">
                <PlanBoard initialItems={plan.items} />
              </div>
            </div>

            {/* Score rail */}
            <div className="lg:sticky lg:top-28 lg:self-start">
              <Reveal delay={0.1}>
                <div className="rounded-lg border border-ink/8 bg-ink p-7 text-paper shadow-card">
                  <p className="eyebrow text-saffron">Responsible Yatra Score</p>
                  <p className="mt-4 font-mono text-6xl font-bold text-paper">
                    {score}
                    <span className="text-2xl text-mist">/100</span>
                  </p>
                  <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-paper/10" aria-hidden>
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-saffron to-verify transition-all duration-700"
                      style={{ width: `${score}%` }}
                    />
                  </div>
                  <dl className="mt-6 space-y-3 border-t border-paper/10 pt-5">
                    {breakdown.map((b) => (
                      <div key={b.label} className="flex items-baseline justify-between gap-3 text-sm">
                        <dt className="text-mist">{b.label}</dt>
                        <dd className="font-mono font-bold text-saffron">+{b.value}</dd>
                      </div>
                    ))}
                  </dl>
                  <p className="mt-5 text-[11px] leading-relaxed text-mist">
                    A Yatra Setu platform metric — a guide for lighter travel, not a
                    scientifically validated index.
                  </p>
                </div>
              </Reveal>

              <Reveal delay={0.2}>
                <div className="mt-4 rounded-lg border border-ink/8 bg-paper-raised p-5 shadow-card">
                  <p className="flex items-center gap-2 font-display text-lg text-ink">
                    <Compass className="size-4.5 text-saffron-deep" aria-hidden />
                    Add from the catalog
                  </p>
                  <p className="mt-1.5 text-xs leading-relaxed text-stone">
                    Destinations and upcoming restoration events, one tap each.
                  </p>
                  <div className="mt-4">
                    <AddToPlan
                      destinations={destinations.map((d) => ({ id: d.id, name: d.name, region: d.region }))}
                      events={events.map((e) => ({
                        id: e.id,
                        title: e.title,
                        destination: e.destination.name,
                        date: e.date.toISOString(),
                      }))}
                    />
                  </div>
                </div>
              </Reveal>

              <Reveal delay={0.3}>
                <p className="mt-4 text-center text-xs text-stone">
                  Want a route designed for you?{" "}
                  <Link href="/explore" className="font-semibold text-saffron-deep hover:underline">
                    Browse the curated journeys
                  </Link>
                </p>
              </Reveal>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
