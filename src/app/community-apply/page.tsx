import type { Metadata } from "next";
import Link from "next/link";
import { BadgeCheck, CalendarCheck2, ClipboardCheck, Megaphone, QrCode, ShieldCheck, TrendingUp } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { ButtonLink } from "@/components/ui/button";
import { ApplyForm } from "@/components/community/apply-form";
import { auth } from "@/auth";

export const metadata: Metadata = {
  title: "Become a Community Lead",
  description:
    "NGOs, municipal bodies, NSS/NCC cells and tourism officers: apply to create and run verified restoration events on Yatra Setu.",
};

export const dynamic = "force-dynamic";

const CAPABILITIES = [
  {
    icon: CalendarCheck2,
    title: "Create events",
    desc: "Open cleanups, plantations and heritage-care drives at the places you steward.",
  },
  {
    icon: QrCode,
    title: "Run QR check-in",
    desc: "Your event board prints the code; every volunteer verifies with timestamp + location.",
  },
  {
    icon: BadgeCheck,
    title: "Carry the verified badge",
    desc: "Approved leads' events are marked trusted — travellers RSVP with confidence.",
  },
  {
    icon: TrendingUp,
    title: "Act on spot alerts",
    desc: "See trending alerts in your region and turn the urgent ones into events.",
  },
];

export default async function CommunityApplyPage() {
  const session = await auth();
  const signedIn = Boolean(session?.user?.id);

  return (
    <>
      {/* Hero */}
      <section className="relative flex min-h-[56svh] items-end overflow-hidden bg-ink pb-14 pt-44 text-paper">
        <div
          className="absolute inset-0"
          aria-hidden
          style={{
            background:
              "radial-gradient(70% 90% at 15% 0%, rgb(230 81 0 / 0.14), transparent 60%), radial-gradient(60% 80% at 90% 100%, rgb(0 77 64 / 0.24), transparent 65%)",
          }}
        />
        <Container className="relative">
          <Reveal>
            <p className="eyebrow flex items-center gap-3 text-saffron">
              <span className="h-px w-10 bg-saffron/70" aria-hidden />
              Community leads
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <h1 className="mt-6 max-w-4xl font-display text-[clamp(2.6rem,6vw,5.5rem)] font-medium leading-[0.98] tracking-tight">
              The people who know the place, run the seva.
            </h1>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-paper/80">
              Restoration only works when locals hold the pen. If your organisation stewards a
              shore, ghat, trail or heritage lane — apply to lead events on Yatra Setu.
            </p>
          </Reveal>
        </Container>
      </section>

      {/* Capabilities + form */}
      <section className="bg-paper py-20 sm:py-28">
        <Container className="max-w-6xl">
          <div className="grid gap-12 lg:grid-cols-[1fr_520px]">
            <div>
              <Reveal>
                <p className="eyebrow text-saffron-deep">What leads can do</p>
                <h2 className="mt-3 font-display text-3xl tracking-tight text-ink sm:text-4xl">
                  Authority with accountability
                </h2>
              </Reveal>
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {CAPABILITIES.map((c, i) => (
                  <Reveal key={c.title} delay={0.08 * i}>
                    <div className="h-full rounded-lg border border-ink/8 bg-paper-raised p-5 shadow-card">
                      <span className="flex size-10 items-center justify-center rounded-full bg-ink text-paper">
                        <c.icon className="size-4.5" aria-hidden />
                      </span>
                      <h3 className="mt-4 font-display text-lg tracking-tight text-ink">{c.title}</h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-stone">{c.desc}</p>
                    </div>
                  </Reveal>
                ))}
              </div>
              <Reveal delay={0.2}>
                <div className="mt-8 rounded-lg border border-verify/25 bg-verify/8 p-5">
                  <p className="flex items-center gap-2 font-display text-lg text-ink">
                    <ShieldCheck className="size-5 text-verify" aria-hidden />
                    Verification is the whole point
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-stone">
                    Anyone can volunteer. Only verified leads create events — that is what makes
                    every stamp, certificate and reward on this platform mean something.
                  </p>
                </div>
              </Reveal>
            </div>

            {/* Form / auth gate */}
            <div className="lg:sticky lg:top-28 lg:self-start">
              <Reveal delay={0.1}>
                <div className="rounded-lg border border-ink/8 bg-paper-raised p-6 shadow-card sm:p-8">
                  <p className="eyebrow text-saffron-deep">Application</p>
                  <h2 className="mt-3 flex items-center gap-2 font-display text-2xl tracking-tight text-ink">
                    <ClipboardCheck className="size-5 text-saffron-deep" aria-hidden />
                    Apply for lead status
                  </h2>
                  {signedIn ? (
                    <div className="mt-6">
                      <ApplyForm />
                    </div>
                  ) : (
                    <div className="mt-6">
                      <p className="text-sm leading-relaxed text-stone">
                        Applications are tied to your Yatra Setu account so the review — and the
                        verified badge — attaches to a real person.
                      </p>
                      <div className="mt-5 flex flex-col gap-3">
                        <ButtonLink href="/login?next=/community-apply" size="lg">
                          <Megaphone className="size-4" aria-hidden />
                          Sign in to apply
                        </ButtonLink>
                        <Link
                          href="/register?next=/community-apply"
                          className="text-center text-sm font-semibold text-saffron-deep hover:underline"
                        >
                          New here? Create an account first
                        </Link>
                      </div>
                    </div>
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
