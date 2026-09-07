import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowUpRight, MapPin, ShieldCheck, Stamp as StampIcon } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Yatra Passport",
  description:
    "Your verified record — every check-in, stamp and service point, earned on the ground and stored in the ledger.",
};

export const dynamic = "force-dynamic";

export default async function PassportPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?next=/passport");

  const [user, rsvps, stamps, redemptions] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true, points: true, city: true, createdAt: true },
    }),
    prisma.eventRSVP.findMany({
      where: { userId: session.user.id, checkin: { isNot: null } },
      orderBy: { createdAt: "desc" },
      include: {
        checkin: { select: { verifiedAt: true, method: true } },
        event: {
          select: {
            slug: true,
            title: true,
            date: true,
            destination: { select: { name: true, region: true } },
          },
        },
      },
    }),
    prisma.userStamp.findMany({
      where: { userId: session.user.id },
      orderBy: { earnedAt: "desc" },
      include: { stamp: true },
    }),
    prisma.redemption.findMany({
      where: { userId: session.user.id },
      orderBy: { redeemedAt: "desc" },
      include: { reward: { select: { title: true, value: true } } },
    }),
  ]);

  if (!user) redirect("/login?next=/passport");

  const attendances = rsvps.map((r) => ({
    id: r.id,
    verifiedAt: r.checkin?.verifiedAt ?? r.createdAt,
    method: r.checkin?.method ?? "qr",
    event: r.event,
  }));

  const hours = attendances.length * 3; // ~3 hours per seva morning

  return (
    <>
      {/* Hero */}
      <section className="relative flex min-h-[52svh] items-end overflow-hidden bg-ink pb-14 pt-44 text-paper">
        <div
          className="absolute inset-0"
          aria-hidden
          style={{
            background:
              "radial-gradient(75% 90% at 80% 0%, rgb(230 81 0 / 0.15), transparent 60%), radial-gradient(60% 70% at 10% 100%, rgb(0 77 64 / 0.25), transparent 65%)",
          }}
        />
        <Container className="relative">
          <Reveal>
            <p className="eyebrow flex items-center gap-3 text-saffron">
              <span className="h-px w-10 bg-saffron/70" aria-hidden />
              Yatra Passport
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <h1 className="mt-6 font-display text-[clamp(2.4rem,6vw,5rem)] font-medium leading-[0.98] tracking-tight">
              {user.name}
            </h1>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-paper/75">
              <span className="inline-flex items-center gap-2">
                <ShieldCheck className="size-4 text-verify" aria-hidden />
                {attendances.length} verified check-in{attendances.length === 1 ? "" : "s"}
              </span>
              <span className="inline-flex items-center gap-2">
                <StampIcon className="size-4 text-saffron" aria-hidden />
                {stamps.length} stamp{stamps.length === 1 ? "" : "s"}
              </span>
              <span className="inline-flex items-center gap-2 font-mono">
                {user.points.toLocaleString("en-IN")} points
              </span>
              {user.city && (
                <span className="inline-flex items-center gap-2">
                  <MapPin className="size-4 text-saffron" aria-hidden />
                  {user.city}
                </span>
              )}
            </p>
          </Reveal>
        </Container>
      </section>

      {/* The record */}
      <section className="bg-paper py-20 sm:py-24">
        <Container className="max-w-5xl">
          <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr]">
            {/* Attendance ledger */}
            <div>
              <p className="eyebrow text-saffron-deep">The ledger</p>
              <h2 className="mt-3 font-display text-3xl tracking-tight text-ink">
                Verified participation
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-stone">
                Every entry below came from a QR check-in at the site — timestamped by the
                server, never claimed from a button.
              </p>
              <div className="mt-8 space-y-3">
                {attendances.length === 0 && (
                  <div className="rounded-lg border border-dashed border-ink/15 p-8 text-center">
                    <p className="text-sm text-stone">
                      No check-ins yet. Your first seva is the hardest step — after that it's a
                      habit.
                    </p>
                    <ButtonLink href="/events" size="sm" variant="outline-dark" className="mt-4">
                      Find an event
                      <ArrowUpRight className="size-4" aria-hidden />
                    </ButtonLink>
                  </div>
                )}
                {attendances.map((a, i) => (
                  <Reveal key={a.id} delay={Math.min(i * 0.05, 0.25)}>
                    <article className="rounded-lg border border-verify/20 bg-paper-raised p-5 shadow-card">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <Badge tone="verify">
                          <ShieldCheck className="size-3" aria-hidden />
                          Verified
                        </Badge>
                        <time className="text-xs text-stone" dateTime={a.verifiedAt.toISOString()}>
                          {formatDate(a.verifiedAt)}
                        </time>
                      </div>
                      <h3 className="mt-3 font-display text-xl tracking-tight text-ink">
                        <Link href={`/events/${a.event.slug}`} className="hover:underline">
                          {a.event.title}
                        </Link>
                      </h3>
                      <p className="mt-1 text-sm text-stone">
                        {a.event.destination.name} · {a.event.destination.region}
                      </p>
                    </article>
                  </Reveal>
                ))}
              </div>
            </div>

            {/* Stamps + redemptions rail */}
            <div className="space-y-6">
              <Reveal delay={0.1}>
                <div className="rounded-lg border border-ink/8 bg-paper-raised p-6 shadow-card">
                  <p className="eyebrow text-saffron-deep">Stamps</p>
                  <div className="mt-4 flex flex-wrap gap-2.5">
                    {stamps.length === 0 && (
                      <p className="text-sm text-stone">Your collection starts with one check-in.</p>
                    )}
                    {stamps.map((s) => (
                      <span
                        key={s.id}
                        className="grid size-12 place-items-center rounded-full border-2 border-dashed text-lg"
                        style={{ borderColor: s.stamp.color ?? "#E65100" }}
                        title={`${s.stamp.name} · earned ${formatDate(s.earnedAt)}`}
                        aria-label={`${s.stamp.name} stamp, earned ${formatDate(s.earnedAt)}`}
                      >
                        <span aria-hidden>✦</span>
                      </span>
                    ))}
                  </div>
                  <p className="mt-4 text-xs leading-relaxed text-stone">
                    Roughly {hours} hours contributed across {attendances.length} seva
                    {attendances.length === 1 ? "" : "s"}.
                  </p>
                </div>
              </Reveal>

              <Reveal delay={0.2}>
                <div className="rounded-lg border border-ink/8 bg-paper-raised p-6 shadow-card">
                  <p className="eyebrow text-saffron-deep">Redemptions</p>
                  {redemptions.length === 0 ? (
                    <p className="mt-3 text-sm text-stone">
                      Nothing redeemed yet —{" "}
                      <Link href="/rewards" className="font-semibold text-saffron-deep hover:underline">
                        see what your stamps are worth
                      </Link>
                      .
                    </p>
                  ) : (
                    <ul className="mt-4 space-y-3">
                      {redemptions.map((r) => (
                        <li key={r.id} className="flex items-center justify-between gap-3 text-sm">
                          <span className="min-w-0">
                            <span className="block truncate font-medium text-ink">
                              {r.reward.title}
                            </span>
                            <span className="text-xs text-stone">{formatDate(r.redeemedAt)}</span>
                          </span>
                          <code className="shrink-0 rounded-sm border border-ink/12 bg-paper px-2.5 py-1 font-mono text-xs font-bold text-ink">
                            {r.code}
                          </code>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </Reveal>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
