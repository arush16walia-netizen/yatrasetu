import type { Metadata } from "next";
import { Clock3, Flame, MapPin, Radio, ShieldCheck } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { Badge } from "@/components/ui/badge";
import { AlertForm } from "@/components/alerts/alert-form";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Trending spot alerts",
  description:
    "See the places being loved past their limit — overcrowding, waste and damage reports from travellers on the ground.",
};

export const dynamic = "force-dynamic";

const CATEGORY_LABEL: Record<string, string> = {
  OVERCROWDING: "Overcrowding",
  WASTE: "Waste overflow",
  DAMAGE: "Damage",
};

function StatusBadge({ status }: { status: string }) {
  if (status === "VERIFIED") return <Badge tone="teal">Verified</Badge>;
  if (status === "RESOLVED") return <Badge tone="verify">Resolved</Badge>;
  return <Badge tone="saffron">Open</Badge>;
}

function timeAgo(date: Date): string {
  const mins = Math.floor((Date.now() - date.getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default async function TrendingPage() {
  const session = await auth();
  const [reports, openCount, verifiedCount, resolvedCount] = await Promise.all([
    prisma.spotReport.findMany({
      orderBy: { createdAt: "desc" },
      take: 24,
      include: { user: { select: { name: true } } },
    }),
    prisma.spotReport.count({ where: { status: "OPEN" } }),
    prisma.spotReport.count({ where: { status: "VERIFIED" } }),
    prisma.spotReport.count({ where: { status: "RESOLVED" } }),
  ]);

  return (
    <>
      {/* Hero */}
      <section className="relative flex min-h-[56svh] items-end overflow-hidden bg-ink pb-14 pt-44 text-paper">
        <div
          className="absolute inset-0"
          aria-hidden
          style={{
            background:
              "radial-gradient(80% 90% at 80% 0%, rgb(230 81 0 / 0.13), transparent 60%), radial-gradient(60% 70% at 10% 100%, rgb(0 77 64 / 0.22), transparent 65%)",
          }}
        />
        <Container className="relative">
          <Reveal>
            <p className="eyebrow flex items-center gap-3 text-saffron">
              <span className="h-px w-10 bg-saffron/70" aria-hidden />
              Trending spot alerts
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <h1 className="mt-6 max-w-4xl font-display text-[clamp(2.6rem,6vw,5.5rem)] font-medium leading-[0.98] tracking-tight">
              Love, measured in footfall.
            </h1>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-paper/80">
              Virality has a cost, and places pay it. This board is where travellers flag the
              spots being loved past their limit — so a cleanup can be planned before the
              damage sets in.
            </p>
          </Reveal>
          <Reveal delay={0.3}>
            <div className="mt-8 flex flex-wrap gap-2.5">
              <span className="inline-flex items-center gap-2 rounded-full border border-paper/15 bg-paper/5 px-4 py-2 text-sm text-paper/85">
                <Flame className="size-4 text-saffron" aria-hidden />
                {openCount} open alerts
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-paper/15 bg-paper/5 px-4 py-2 text-sm text-paper/85">
                <ShieldCheck className="size-4 text-teal" aria-hidden />
                {verifiedCount} verified by leads
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-paper/15 bg-paper/5 px-4 py-2 text-sm text-paper/85">
                <Radio className="size-4 text-saffron" aria-hidden />
                {resolvedCount} resolved
              </span>
            </div>
          </Reveal>
        </Container>
      </section>

      {/* Report + board */}
      <section className="bg-paper py-20 sm:py-28">
        <Container className="max-w-6xl">
          <div className="grid gap-10 lg:grid-cols-[1fr_460px]">
            {/* Live board */}
            <div>
              <Reveal>
                <div className="flex items-end justify-between gap-6">
                  <div>
                    <p className="eyebrow text-saffron-deep">The board</p>
                    <h2 className="mt-3 font-display text-3xl tracking-tight text-ink sm:text-4xl">
                      Places that need attention
                    </h2>
                  </div>
                  <p className="hidden text-sm text-stone sm:block">Newest first</p>
                </div>
              </Reveal>

              <div className="mt-8 space-y-3">
                {reports.length === 0 && (
                  <p className="rounded-lg border border-dashed border-ink/15 p-8 text-center text-sm text-stone">
                    No alerts yet. If you see a place struggling, be the first to say so.
                  </p>
                )}
                {reports.map((r, i) => (
                  <Reveal key={r.id} delay={Math.min(i * 0.04, 0.3)}>
                    <article className="rounded-lg border border-ink/8 bg-paper-raised p-5 shadow-card sm:p-6">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                        <StatusBadge status={r.status} />
                        <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone">
                          {CATEGORY_LABEL[r.category] ?? r.category}
                        </span>
                        <span className="ml-auto flex items-center gap-1.5 text-xs text-stone">
                          <Clock3 className="size-3" aria-hidden />
                          {timeAgo(r.createdAt)}
                        </span>
                      </div>
                      <h3 className="mt-3 font-display text-xl tracking-tight text-ink">
                        {r.spotName}
                        {r.region && (
                          <span className="ml-2 inline-flex items-center gap-1 text-sm font-normal text-stone">
                            <MapPin className="size-3.5 text-saffron-deep" aria-hidden />
                            {r.region}
                          </span>
                        )}
                      </h3>
                      {r.description && (
                        <p className="mt-2 text-sm leading-relaxed text-stone">{r.description}</p>
                      )}
                      <p className="mt-3 text-xs text-stone">
                        Filed by <span className="font-semibold text-ink/80">{r.user?.name ?? "A traveller"}</span>
                      </p>
                    </article>
                  </Reveal>
                ))}
              </div>
            </div>

            {/* Report form */}
            <div className="lg:sticky lg:top-28 lg:self-start">
              <Reveal delay={0.1}>
                <div className="rounded-lg border border-ink/8 bg-paper-raised p-6 shadow-card sm:p-8">
                  <p className="eyebrow text-saffron-deep">Report a spot</p>
                  <h2 className="mt-3 font-display text-2xl tracking-tight text-ink">
                    Saw a place struggling?
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-stone">
                    File it here. Every alert is timestamped, signed and visible to community
                    leads — the first step toward a restoration event.
                  </p>
                  <div className="mt-6">
                    <AlertForm signedIn={Boolean(session?.user?.id)} />
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
