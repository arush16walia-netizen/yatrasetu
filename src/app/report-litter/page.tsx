import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { MountainSnow, Recycle } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { Badge } from "@/components/ui/badge";
import { LitterReportForm } from "@/components/litter/report-form";
import { litterCategoryLabel, litterVolumeLabel } from "@/lib/litter";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Report litter",
  description:
    "Flag a garbage dump on a remote trail with GPS proof — a cleanup ticket goes to local crews and you earn +50 service points.",
};

export const dynamic = "force-dynamic";


export default async function ReportLitterPage() {
  const session = await auth();

  if (!session?.user?.id) redirect("/login?next=/report-litter");

  const reports = await prisma.litterReport.findMany({
    orderBy: { createdAt: "desc" },
    take: 8,
    include: { user: { select: { name: true } } },
  });

  return (
    <>
      {/* Hero */}
      <section className="relative flex min-h-[46svh] items-end overflow-hidden bg-ink pb-14 pt-44 text-paper">
        <div
          className="absolute inset-0"
          aria-hidden
          style={{
            background:
              "radial-gradient(75% 90% at 85% 0%, rgb(0 105 92 / 0.3), transparent 60%), radial-gradient(55% 70% at 8% 100%, rgb(230 81 0 / 0.12), transparent 65%)",
          }}
        />
        <Container className="relative">
          <Reveal>
            <p className="eyebrow flex items-center gap-3 text-saffron">
              <span className="h-px w-10 bg-saffron/70" aria-hidden />
              Swachh Yatra
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <h1 className="mt-6 max-w-4xl font-display text-[clamp(2.4rem,6vw,5rem)] font-medium leading-[0.98] tracking-tight">
              See a dump on the trail?
              <br />
              <span className="text-paper/60 italic">Report it. A crew gets dispatched.</span>
            </h1>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-paper/80">
              Remote trails never see municipal sanitation. Your GPS-tagged report becomes a
              cleanup ticket for local crews — and earns +50 service points the moment it files.
            </p>
          </Reveal>
        </Container>
      </section>

      {/* Form + feed */}
      <section className="bg-paper py-16 sm:py-20">
        <Container className="max-w-6xl">
          <div className="grid gap-12 lg:grid-cols-[1.15fr_1fr]">
            <Reveal>
              <div className="rounded-lg border border-ink/8 bg-paper-raised p-6 shadow-card sm:p-8">
                <p className="eyebrow text-saffron-deep">New report</p>
                <h2 className="mt-3 font-display text-2xl tracking-tight text-ink">
                  Pin the spot. Estimate the load.
                </h2>
                <div className="mt-6">
                  <LitterReportForm />
                </div>
              </div>
            </Reveal>

            <div>
              <Reveal delay={0.1}>
                <div className="flex items-center gap-2.5">
                  <Recycle className="size-4 text-teal" aria-hidden />
                  <h2 className="font-display text-xl tracking-tight text-ink">The live feed</h2>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-stone">
                  Every ticket below is a real ledger entry — dispatched, then worked and marked
                  restored by the crews.
                </p>
              </Reveal>
              <div className="mt-6 space-y-3">
                {reports.length === 0 && (
                  <p className="rounded-lg border border-dashed border-ink/15 p-8 text-center text-sm text-stone">
                    No reports yet — the first one sets the standard.
                  </p>
                )}
                {reports.map((r, i) => (
                  <Reveal key={r.id} delay={Math.min(i * 0.05, 0.25)}>
                    <article className="rounded-lg border border-ink/8 bg-paper-raised p-4 shadow-card sm:p-5">
                      <div className="flex flex-wrap items-center gap-2">
                        <code className="rounded-sm border border-ink/12 bg-paper px-2.5 py-1 font-mono text-xs font-bold text-ink">
                          {r.ticketCode}
                        </code>
                        <Badge tone={r.status === "RESTORED" ? "verify" : "saffron"}>
                          {r.status.toLowerCase()}
                        </Badge>
                        <span className="ml-auto text-xs text-stone">{formatDate(r.createdAt)}</span>
                      </div>
                      <h3 className="mt-2.5 flex items-start gap-2 font-display text-lg tracking-tight text-ink">
                        <MountainSnow className="mt-1 size-4 shrink-0 text-stone" aria-hidden />
                        {r.spotName}
                        {r.region && <span className="font-normal text-stone">· {r.region}</span>}
                      </h3>
                      <p className="mt-1.5 text-xs text-stone">
                        {litterCategoryLabel(r.category)} · {litterVolumeLabel(r.volume)}
                        {r.latitude != null && r.longitude != null && (
                          <> · {r.latitude.toFixed(3)}, {r.longitude.toFixed(3)}</>
                        )}
                        {r.hasPhoto && <> · photo attached</>}
                      </p>
                      {r.description && (
                        <p className="mt-2 text-sm leading-relaxed text-stone">{r.description}</p>
                      )}
                    </article>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
