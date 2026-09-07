import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { ApplicationReview } from "@/components/leader/application-review";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Admin review",
  description: "Verify community leads and keep the ledger honest.",
};

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await auth();

  if (!session?.user?.id) redirect("/login?next=/admin");

  const me = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, name: true },
  });

  if (me?.role !== "ADMIN") {
    return (
      <section className="flex min-h-[80vh] flex-col justify-center bg-ink pt-40 text-paper">
        <Container>
          <Reveal>
            <p className="eyebrow text-saffron">Admins only</p>
          </Reveal>
          <Reveal delay={0.08}>
            <h1 className="mt-5 max-w-2xl font-display text-5xl leading-[1.02] tracking-tight sm:text-6xl">
              This room stays locked.
            </h1>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-mist">
              Admin tools verify community leads and moderate the platform. If you believe you
              should have access, write to the stewards.
            </p>
          </Reveal>
          <Reveal delay={0.24}>
            <div className="mt-10">
              <ButtonLink href="/" variant="outline-light" size="lg">
                Back to the journey
              </ButtonLink>
            </div>
          </Reveal>
        </Container>
      </section>
    );
  }

  const applications = await prisma.communityApplication.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: { select: { name: true, email: true, city: true } } },
  });

  const pending = applications.filter((a) => a.status === "PENDING");

  return (
    <>
      <section className="relative flex min-h-[38svh] items-end overflow-hidden bg-ink pb-12 pt-44 text-paper">
        <div
          className="absolute inset-0"
          aria-hidden
          style={{
            background:
              "radial-gradient(70% 90% at 15% 0%, rgb(230 81 0 / 0.15), transparent 60%)",
          }}
        />
        <Container className="relative">
          <Reveal>
            <p className="eyebrow flex items-center gap-3 text-saffron">
              <span className="h-px w-10 bg-saffron/70" aria-hidden />
              Admin
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <h1 className="mt-6 font-display text-[clamp(2.2rem,5vw,4.5rem)] font-medium leading-[0.98] tracking-tight">
              The verification desk.
            </h1>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="mt-4 flex items-center gap-2 text-sm text-paper/75">
              <ShieldCheck className="size-4 text-verify" aria-hidden />
              {pending.length} application{pending.length === 1 ? "" : "s"} waiting for review
            </p>
          </Reveal>
        </Container>
      </section>

      <section className="bg-paper py-16 sm:py-20">
        <Container className="max-w-5xl">
          <div className="space-y-3">
            {applications.length === 0 && (
              <p className="rounded-lg border border-dashed border-ink/15 p-8 text-center text-sm text-stone">
                No applications yet. When someone applies at /community-apply, they land here.
              </p>
            )}
            {applications.map((a, i) => (
              <Reveal key={a.id} delay={Math.min(i * 0.05, 0.25)}>
                <article className="rounded-lg border border-ink/8 bg-paper-raised p-6 shadow-card">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge
                      tone={
                        a.status === "APPROVED"
                          ? "verify"
                          : a.status === "REJECTED"
                            ? "ember"
                            : "saffron"
                      }
                    >
                      {a.status.toLowerCase()}
                    </Badge>
                    <span className="text-xs text-stone">
                      applied {formatDate(a.createdAt)}
                      {a.reviewedAt ? ` · reviewed ${formatDate(a.reviewedAt)}` : ""}
                    </span>
                  </div>
                  <h2 className="mt-3 font-display text-xl tracking-tight text-ink">
                    {a.user.name}
                  </h2>
                  <p className="text-sm text-stone">
                    {a.user.email}
                    {a.user.city ? ` · ${a.user.city}` : ""}
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-stone">
                    <span className="font-semibold text-ink/80">{a.orgName}</span> ·{" "}
                    {a.affiliation.toLowerCase()}
                    {a.contactEmail ? ` · ${a.contactEmail}` : ""}
                  </p>
                  {a.status === "PENDING" && (
                    <div className="mt-4 border-t border-ink/8 pt-4">
                      <ApplicationReview applicationId={a.id} applicantName={a.user.name} />
                    </div>
                  )}
                </article>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
