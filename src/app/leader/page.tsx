import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowUpRight,
  CalendarPlus,
  QrCode,
  Users,
} from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { CreateEventForm } from "@/components/leader/create-event-form";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Leader dashboard",
  description: "Create restoration events, watch RSVPs fill and verify attendance.",
};

export const dynamic = "force-dynamic";

export default async function LeaderPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login?next=/leader");
  }

  const me = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      role: true,
      isOrganizer: true,
      communityApplication: { select: { status: true } },
    },
  });

  const isLeader =
    me?.role === "ADMIN" || me?.isOrganizer || me?.communityApplication?.status === "APPROVED";

  if (!isLeader) {
    return (
      <section className="flex min-h-[80vh] flex-col justify-center bg-ink pt-40 text-paper">
        <Container>
          <Reveal>
            <p className="eyebrow text-saffron">Leaders only</p>
          </Reveal>
          <Reveal delay={0.08}>
            <h1 className="mt-5 max-w-2xl font-display text-5xl leading-[1.02] tracking-tight sm:text-6xl">
              This desk is for verified leads.
            </h1>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-mist">
              Community leads create restoration events, manage crews and verify attendance.
              Apply once — an admin reviews every application before the tools unlock.
            </p>
          </Reveal>
          <Reveal delay={0.24}>
            <div className="mt-10 flex flex-wrap gap-3">
              <ButtonLink href="/community-apply" size="lg">
                Apply to become a lead
              </ButtonLink>
              <ButtonLink href="/events" size="lg" variant="outline-light">
                Browse events instead
              </ButtonLink>
            </div>
          </Reveal>
        </Container>
      </section>
    );
  }

  const myEvents = await prisma.restorationEvent.findMany({
    where: { organizerId: session.user.id },
    orderBy: { date: "desc" },
    include: {
      destination: { select: { name: true, region: true } },
      rsvps: {
        where: { status: "CONFIRMED" },
        select: { id: true, checkin: { select: { id: true } } },
      },
    },
  });

  const totals = myEvents.reduce(
    (acc, e) => ({
      rsvps: acc.rsvps + e.rsvps.length,
      verified: acc.verified + e.rsvps.filter((r) => r.checkin).length,
    }),
    { rsvps: 0, verified: 0 },
  );

  return (
    <>
      {/* Hero */}
      <section className="relative flex min-h-[42svh] items-end overflow-hidden bg-ink pb-12 pt-44 text-paper">
        <div
          className="absolute inset-0"
          aria-hidden
          style={{
            background:
              "radial-gradient(70% 90% at 85% 0%, rgb(0 77 64 / 0.3), transparent 60%)",
          }}
        />
        <Container className="relative">
          <Reveal>
            <p className="eyebrow flex items-center gap-3 text-saffron">
              <span className="h-px w-10 bg-saffron/70" aria-hidden />
              Leader dashboard
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <h1 className="mt-6 font-display text-[clamp(2.2rem,5vw,4.5rem)] font-medium leading-[0.98] tracking-tight">
              Good to see you, {me?.name?.split(" ")[0]}.
            </h1>
          </Reveal>
          <Reveal delay={0.2}>
            <div className="mt-6 flex flex-wrap gap-2.5">
              <span className="inline-flex items-center gap-2 rounded-full border border-paper/15 bg-paper/5 px-4 py-2 text-sm text-paper/85">
                <CalendarPlus className="size-4 text-saffron" aria-hidden />
                {myEvents.length} events created
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-paper/15 bg-paper/5 px-4 py-2 text-sm text-paper/85">
                <Users className="size-4 text-saffron" aria-hidden />
                {totals.rsvps} RSVPs
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-paper/15 bg-paper/5 px-4 py-2 text-sm text-paper/85">
                <QrCode className="size-4 text-verify" aria-hidden />
                {totals.verified} verified check-ins
              </span>
            </div>
          </Reveal>
        </Container>
      </section>

      <section className="bg-paper py-16 sm:py-20">
        <Container className="max-w-6xl">
          <div className="grid gap-12 lg:grid-cols-[1.1fr_1fr]">
            {/* Events list */}
            <div>
              <p className="eyebrow text-saffron-deep">Your events</p>
              <h2 className="mt-3 font-display text-3xl tracking-tight text-ink">
                Crews you're leading
              </h2>
              <div className="mt-8 space-y-3">
                {myEvents.length === 0 && (
                  <p className="rounded-lg border border-dashed border-ink/15 p-8 text-center text-sm text-stone">
                    No events yet — publish your first one from the form on the right.
                  </p>
                )}
                {myEvents.map((e, i) => (
                  <Reveal key={e.id} delay={Math.min(i * 0.05, 0.25)}>
                    <article className="rounded-lg border border-ink/8 bg-paper-raised p-5 shadow-card">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge tone={e.status === "OPEN" ? "verify" : "neutral"}>
                          {e.status.toLowerCase()}
                        </Badge>
                        <span className="text-xs text-stone">
                          {e.destination.name} · {formatDate(e.date)} · {e.startTime}
                        </span>
                      </div>
                      <h3 className="mt-2.5 font-display text-xl tracking-tight text-ink">
                        <Link href={`/events/${e.slug}`} className="hover:underline">
                          {e.title}
                        </Link>
                      </h3>
                      <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-stone">
                        <span className="font-semibold text-ink/80">
                          {e.rsvps.length}/{e.capacity} crew
                        </span>
                        <span>{e.rsvps.filter((r) => r.checkin).length} verified on site</span>
                        <Link
                          href={`/events/${e.slug}/board`}
                          className="ml-auto inline-flex items-center gap-1 font-semibold text-saffron-deep hover:underline"
                        >
                          QR board
                          <ArrowUpRight className="size-3.5" aria-hidden />
                        </Link>
                      </div>
                    </article>
                  </Reveal>
                ))}
              </div>
            </div>

            {/* Create form */}
            <div className="lg:sticky lg:top-28 lg:self-start">
              <div className="rounded-lg border border-ink/8 bg-paper-raised p-6 shadow-card sm:p-8">
                <p className="eyebrow text-saffron-deep">New seva</p>
                <h2 className="mt-3 font-display text-2xl tracking-tight text-ink">
                  Put a morning on the calendar.
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-stone">
                  Every event gets its own QR check-in code the moment it's published.
                </p>
                <div className="mt-6">
                  <CreateEventFormWithDestinations />
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}

async function CreateEventFormWithDestinations() {
  const destinations = await prisma.destination.findMany({
    orderBy: { name: "asc" },
    select: { slug: true, name: true },
  });
  return <CreateEventForm destinations={destinations} />;
}
