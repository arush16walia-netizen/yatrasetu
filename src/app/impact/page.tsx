import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowUpRight,
  CalendarCheck2,
  ClipboardCheck,
  Flag,
  MapPin,
  ScanLine,
  Stamp,
  Users,
} from "lucide-react";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Impact",
  description:
    "The real, live ledger of Yatra Setu: verified contributions, volunteer hours, stamps earned and alerts resolved — computed from the records, not a brochure.",
};

export const dynamic = "force-dynamic";

function fmt(n: number): string {
  return n.toLocaleString("en-IN");
}

export default async function ImpactPage() {
  const [
    attendanceCount,
    attendedRsvps,
    verifiedUsers,
    eventsHeld,
    eventsUpcoming,
    stampsAwarded,
    destinationsCount,
    reportsOpen,
    reportsResolved,
    recentCheckins,
    topDestinations,
  ] = await Promise.all([
    prisma.attendanceRecord.count(),
    prisma.eventRSVP.count({ where: { status: "ATTENDED" } }),
    prisma.attendanceRecord.groupBy({ by: ["userId"], where: { userId: { not: null } } }),
    prisma.restorationEvent.count({ where: { date: { lt: new Date() } } }),
    prisma.restorationEvent.count({ where: { date: { gte: new Date() } } }),
    prisma.userStamp.count(),
    prisma.destination.count(),
    prisma.spotReport.count({ where: { status: { in: ["OPEN", "VERIFIED"] } } }),
    prisma.spotReport.count({ where: { status: "RESOLVED" } }),
    prisma.attendanceRecord.findMany({
      orderBy: { verifiedAt: "desc" },
      take: 6,
      include: {
        user: { select: { name: true } },
        rsvp: {
          include: {
            event: {
              select: { title: true, slug: true, date: true, destination: { select: { name: true } } },
            },
          },
        },
        stamp: { select: { name: true, nameHindi: true } },
      },
    }),
    prisma.destination.findMany({
      orderBy: { events: { _count: "desc" } },
      take: 5,
      select: { slug: true, name: true, region: true, _count: { select: { events: true } } },
    }),
  ]);

  const volunteerHours = attendanceCount * 3; // events run 3+ hours; the roster is the source of truth for people, this derives hours
  const stats = [
    { icon: ClipboardCheck, value: fmt(attendanceCount), label: "Verified contributions", note: "QR or code check-ins, geo-confirmed" },
    { icon: Users, value: fmt(verifiedUsers.length), label: "Travellers who gave back", note: "Distinct verified participants" },
    { icon: CalendarCheck2, value: fmt(eventsHeld), label: "Events held", note: `${eventsUpcoming} more open for RSVP` },
    { icon: Stamp, value: fmt(stampsAwarded), label: "Stamps earned", note: "Each one tied to a verified record" },
  ];

  return (
    <>
      {/* Hero */}
      <section className="relative flex min-h-[60svh] items-end overflow-hidden bg-ink pb-16 pt-44 text-paper">
        <div
          className="absolute inset-0"
          aria-hidden
          style={{
            background:
              "radial-gradient(85% 90% at 85% 0%, rgb(230 81 0 / 0.15), transparent 60%), radial-gradient(60% 80% at 8% 100%, rgb(0 77 64 / 0.26), transparent 65%)",
          }}
        />
        <Container className="relative">
          <Reveal>
            <p className="eyebrow flex items-center gap-3 text-saffron">
              <span className="h-px w-10 bg-saffron/70" aria-hidden />
              The impact ledger
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <h1 className="mt-6 max-w-4xl font-display text-[clamp(2.6rem,6vw,5.5rem)] font-medium leading-[0.98] tracking-tight">
              No brochures. Only records.
            </h1>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-paper/80">
              Every number below is computed from the same database that powers check-ins,
              stamps and passports. If a contribution isn&rsquo;t verified, it isn&rsquo;t counted.
            </p>
          </Reveal>
        </Container>
      </section>

      {/* Stats */}
      <section className="border-b border-ink/8 bg-paper py-16">
        <Container className="max-w-6xl">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {stats.map((s, i) => (
              <Reveal key={s.label} delay={i * 0.07}>
                <div className="h-full rounded-lg border border-ink/8 bg-paper-raised p-6 shadow-card">
                  <span className="flex size-11 items-center justify-center rounded-full bg-ink text-paper">
                    <s.icon className="size-5" aria-hidden />
                  </span>
                  <p className="mt-5 font-display text-4xl tracking-tight text-ink sm:text-5xl">{s.value}</p>
                  <p className="mt-1.5 text-sm font-semibold text-ink/80">{s.label}</p>
                  <p className="mt-1 text-xs leading-relaxed text-stone">{s.note}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal delay={0.2}>
            <p className="mt-6 text-sm text-stone">
              That&rsquo;s <span className="font-semibold text-ink">≈ {fmt(volunteerHours)} hours</span> of
              hands-on restoration across {destinationsCount} destinations — plus {reportsResolved} alerts
              resolved and {reportsOpen} still calling for a crew.
            </p>
          </Reveal>
        </Container>
      </section>

      {/* Ledger body */}
      <section className="bg-paper py-20 sm:py-24">
        <Container className="max-w-6xl">
          <div className="grid gap-12 lg:grid-cols-[1.15fr_1fr]">
            {/* Recent verified check-ins */}
            <div>
              <Reveal>
                <p className="eyebrow text-saffron-deep">The live ledger</p>
                <h2 className="mt-3 font-display text-3xl tracking-tight text-ink sm:text-4xl">
                  Latest verified check-ins
                </h2>
              </Reveal>
              <div className="mt-8 space-y-3">
                {recentCheckins.length === 0 && (
                  <p className="rounded-lg border border-dashed border-ink/15 p-8 text-center text-sm text-stone">
                    No verified check-ins yet — the first seva writes the first line of this ledger.
                  </p>
                )}
                {recentCheckins.map((a, i) => (
                  <Reveal key={a.id} delay={Math.min(i * 0.05, 0.25)}>
                    <Link
                      href={`/events/${a.rsvp.event.slug}`}
                      className="group flex items-center gap-4 rounded-lg border border-ink/8 bg-paper-raised p-4 shadow-card transition-colors duration-300 hover:border-saffron/40"
                    >
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-verify/15 text-verify">
                        <ScanLine className="size-4.5" aria-hidden />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-ink">
                          {a.user?.name ?? "A traveller"}
                          <span className="font-normal text-stone">
                            {" "}verified at {a.rsvp.event.title}
                          </span>
                        </p>
                        <p className="text-xs text-stone">
                          {a.rsvp.event.destination.name} ·{" "}
                          {a.verifiedAt.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                          {a.stamp ? ` · ${a.stamp.name} stamp earned` : ""}
                        </p>
                      </div>
                      <ArrowUpRight className="size-4 shrink-0 text-stone/50 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </Link>
                  </Reveal>
                ))}
              </div>
            </div>

            {/* Most-needed destinations */}
            <div>
              <Reveal delay={0.1}>
                <p className="eyebrow text-saffron-deep">Where the work is</p>
                <h2 className="mt-3 font-display text-3xl tracking-tight text-ink sm:text-4xl">
                  Most events, per place
                </h2>
              </Reveal>
              <div className="mt-8 space-y-3">
                {topDestinations.map((d, i) => (
                  <Reveal key={d.slug} delay={0.1 + Math.min(i * 0.05, 0.25)}>
                    <Link
                      href={`/explore/${d.slug}`}
                      className="group flex items-center justify-between gap-4 rounded-lg border border-ink/8 bg-paper-raised p-4 shadow-card transition-colors duration-300 hover:border-saffron/40"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-display text-2xl text-saffron-deep/60">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <div>
                          <p className="font-display text-lg tracking-tight text-ink">{d.name}</p>
                          <p className="text-xs text-stone">{d.region}</p>
                        </div>
                      </div>
                      <Badge tone="saffron">
                        <MapPin className="size-3" aria-hidden />
                        {d._count.events} events
                      </Badge>
                    </Link>
                  </Reveal>
                ))}
              </div>
              <Reveal delay={0.25}>
                <div className="mt-8 rounded-lg border border-saffron/30 bg-saffron/10 p-5">
                  <p className="flex items-center gap-2 font-display text-lg text-ink">
                    <Flag className="size-4.5 text-saffron-deep" aria-hidden />
                    {reportsOpen} places flagged by travellers
                  </p>
                  <p className="mt-1.5 text-sm leading-relaxed text-stone">
                    Open spot alerts waiting for a community lead to turn them into events.
                  </p>
                  <ButtonLink href="/trending" variant="outline-dark" size="sm" className="mt-4">
                    See the alert board
                  </ButtonLink>
                </div>
              </Reveal>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
