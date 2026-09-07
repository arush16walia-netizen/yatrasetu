import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowUpRight,
  Coins,
  Copy,
  Gift,
  HandHeart,
  Stamp as StampIcon,
  Ticket,
} from "lucide-react";
import { auth } from "@/auth";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { getUserRewardsView } from "@/lib/rewards";
import { getStamps, getRewards } from "@/lib/queries";
import { formatDate } from "@/lib/utils";
import { RedeemButton } from "@/components/rewards/redeem-button";

export const metadata: Metadata = {
  title: "Stamps & rewards",
  description:
    "Verified contributions earn stamps and service points. Redeem them for stays, walks and journeys — the loop that keeps India alive.",
};

export const dynamic = "force-dynamic";

const STAMP_ICONS: Record<string, string> = {
  ShieldCheck: "🛡️",
  Waves: "🌊",
  Mountain: "🏔️",
  Trees: "🌳",
  Anchor: "⚓",
  Sunrise: "🌅",
  Link2: "🔗",
};

export default async function RewardsPage() {
  const session = await auth();
  const [stamps, catalog] = await Promise.all([getStamps(), getRewards()]);

  const view = session?.user?.id ? await getUserRewardsView(session.user.id) : null;

  return (
    <>
      {/* Hero */}
      <section className="relative flex min-h-[56svh] items-end overflow-hidden bg-ink pb-14 pt-44 text-paper">
        <div
          className="absolute inset-0"
          aria-hidden
          style={{
            background:
              "radial-gradient(80% 90% at 85% 0%, rgb(230 81 0 / 0.16), transparent 60%), radial-gradient(60% 80% at 8% 100%, rgb(0 77 64 / 0.28), transparent 65%)",
          }}
        />
        <Container className="relative">
          <Reveal>
            <p className="eyebrow flex items-center gap-3 text-saffron">
              <span className="h-px w-10 bg-saffron/70" aria-hidden />
              Stamps &amp; rewards
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <h1 className="mt-6 max-w-4xl font-display text-[clamp(2.6rem,6vw,5.5rem)] font-medium leading-[0.98] tracking-tight">
              The more you give back,
              <br />
              <span className="text-paper/60 italic">the more rewarding the journey.</span>
            </h1>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-paper/80">
              Every verified check-in earns 100 service points and a stamp. Stamps unlock
              rewards from partner stays, walks and kitchens — so your next yatra is
              lighter on you and the land.
            </p>
          </Reveal>
        </Container>
      </section>

      {/* Your balance */}
      {view && (
        <section className="border-b border-ink/8 bg-paper-soft py-12" aria-label="Your balance">
          <Container className="max-w-6xl">
            <div className="grid gap-4 sm:grid-cols-3">
              <Reveal>
                <div className="flex items-center gap-5 rounded-lg border border-ink/8 bg-paper-raised p-6 shadow-card">
                  <span className="grid size-14 shrink-0 place-items-center rounded-full bg-ink font-mono text-xl font-bold text-saffron">
                    {view.points.toLocaleString("en-IN")}
                  </span>
                  <div>
                    <p className="font-display text-xl tracking-tight text-ink">Service points</p>
                    <p className="text-xs text-stone">100 per verified check-in</p>
                  </div>
                </div>
              </Reveal>
              <Reveal delay={0.08}>
                <div className="flex items-center gap-5 rounded-lg border border-ink/8 bg-paper-raised p-6 shadow-card">
                  <span className="grid size-14 shrink-0 place-items-center rounded-full bg-saffron/15 font-mono text-xl font-bold text-saffron-deep">
                    {view.stampsOwned}
                  </span>
                  <div>
                    <p className="font-display text-xl tracking-tight text-ink">Stamps earned</p>
                    <p className="text-xs text-stone">of {stamps.length} to collect</p>
                  </div>
                </div>
              </Reveal>
              <Reveal delay={0.16}>
                <div className="flex items-center gap-5 rounded-lg border border-ink/8 bg-paper-raised p-6 shadow-card">
                  <span className="grid size-14 shrink-0 place-items-center rounded-full bg-verify/15 font-mono text-xl font-bold text-verify">
                    {view.redemptions.length}
                  </span>
                  <div>
                    <p className="font-display text-xl tracking-tight text-ink">Rewards redeemed</p>
                    <p className="text-xs text-stone">codes waiting in your account</p>
                  </div>
                </div>
              </Reveal>
            </div>
          </Container>
        </section>
      )}

      {/* Redeem */}
      <section className="bg-paper py-20 sm:py-24" aria-label="Redeem rewards">
        <Container className="max-w-6xl">
          <SectionHeading
            eyebrow="Redeem"
            title={
              <>
                What your seva <span className="text-stone italic">is worth.</span>
              </>
            }
            lede={
              view
                ? `Redemption deducts stamps from your record — real ledger entries, real codes.`
                : "Sign in to redeem — redemptions are tied to your verified contribution record."
            }
          />

          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {(view?.rewards ?? catalog).map((reward, i) => {
              const owned = view.stampsOwned;
              const affordable = owned >= reward.costStamps;
              const already = view.redemptions.some((r) => r.reward.title === reward.title);
              return (
                <Reveal key={reward.code} delay={Math.min(i * 0.06, 0.3)} className="h-full">
                  <div
                    className={`flex h-full flex-col justify-between rounded-lg border bg-paper-raised p-7 shadow-card transition-colors duration-300 ${
                      affordable ? "border-ink/8 hover:border-saffron/40" : "border-ink/8 opacity-80"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="grid size-11 place-items-center rounded-full bg-saffron/15 text-saffron-deep">
                          <Gift className="size-5" aria-hidden />
                        </span>
                        <span className="rounded-sm bg-ink px-3.5 py-1.5 text-xs font-semibold text-paper">
                          {reward.costStamps} {reward.costStamps === 1 ? "stamp" : "stamps"}
                        </span>
                      </div>
                      <h3 className="mt-5 font-display text-2xl tracking-tight text-ink">{reward.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-stone">{reward.description}</p>
                    </div>
                    <div className="mt-6 border-t border-ink/8 pt-4">
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-stone">{reward.partner}</p>
                        <p className="text-sm font-bold text-verify">{reward.value}</p>
                      </div>
                      <div className="mt-4">
                        {view && !already && (
                          <RedeemButton
                            rewardId={reward.id}
                            rewardTitle={reward.title}
                            affordable={affordable}
                            stampsOwned={owned}
                            costStamps={reward.costStamps}
                          />
                        )}
                        {view && already && (
                          <p className="flex items-center gap-2 text-sm font-semibold text-verify">
                            <Ticket className="size-4" aria-hidden />
                            Redeemed — code in your list below
                          </p>
                        )}
                        {!view && (
                          <ButtonLink href="/login?next=/rewards" variant="outline-dark" size="sm" className="w-full">
                            Sign in to redeem
                          </ButtonLink>
                        )}
                      </div>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>

          {!view && (
            <Reveal delay={0.2}>
              <p className="mt-8 text-center text-sm text-stone">
                <Link href="/login?next=/rewards" className="font-semibold text-saffron-deep hover:underline">
                  Sign in
                </Link>{" "}
                to see the full reward catalog and your balance.
              </p>
            </Reveal>
          )}
        </Container>
      </section>

      {/* The stamp collection */}
      <section className="bg-ink py-20 text-paper sm:py-28" aria-label="The stamp collection">
        <Container>
          <SectionHeading
            tone="dark"
            eyebrow="The collection"
            title={
              <>
                Seven stamps. <span className="text-mist italic">Each one earned, never given.</span>
              </>
            }
            lede="Stamps come only from verified check-ins — timestamped, geo-confirmed, permanent."
          />
          <div className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-7">
            {stamps.map((stamp, i) => {
              const owned = view?.stampsOwned != null && i < view.stampsOwned;
              return (
                <Reveal key={stamp.code} delay={i * 0.06}>
                  <div
                    className={`flex flex-col items-center rounded-lg border px-3 py-6 text-center transition-colors duration-300 ${
                      owned ? "border-saffron/40 bg-ink-raised" : "border-paper/10 bg-ink-soft"
                    }`}
                  >
                    <span
                      className="grid size-16 place-items-center rounded-full border-2 border-dashed text-2xl"
                      style={{
                        borderColor: stamp.color ?? "#E65100",
                        opacity: view ? (owned ? 1 : 0.35) : 0.8,
                      }}
                      aria-hidden
                    >
                      {STAMP_ICONS[stamp.icon] ?? "✦"}
                    </span>
                    <p className="mt-4 text-sm font-semibold">{stamp.name}</p>
                    <p className="mt-0.5 font-deva text-xs text-mist">{stamp.nameHindi}</p>
                    <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-mist">
                      {view ? (owned ? "Earned" : "Locked") : `Tier ${stamp.tier}`}
                    </p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </Container>
      </section>

      {/* Redemption codes */}
      {view && view.redemptions.length > 0 && (
        <section className="bg-paper-soft py-20 sm:py-24" aria-label="Your redeemed codes">
          <Container className="max-w-4xl">
            <SectionHeading
              eyebrow="Your codes"
              title={
                <>
                  Redeemed &amp; <span className="text-stone italic">ready to use.</span>
                </>
              }
            />
            <div className="mt-10 space-y-3">
              {view.redemptions.map((r, i) => (
                <Reveal key={r.id} delay={Math.min(i * 0.05, 0.25)}>
                  <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-verify/25 bg-paper-raised p-5 shadow-card">
                    <div className="flex items-center gap-4">
                      <span className="grid size-11 place-items-center rounded-full bg-verify/15 text-verify">
                        <Ticket className="size-5" aria-hidden />
                      </span>
                      <div>
                        <p className="font-display text-lg tracking-tight text-ink">{r.reward.title}</p>
                        <p className="text-xs text-stone">
                          {r.reward.partner} · redeemed {formatDate(r.redeemedAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <code className="rounded-sm border border-ink/12 bg-paper px-4 py-2 font-mono text-sm font-bold tracking-wider text-ink">
                        {r.code}
                      </code>
                      <Badge tone="verify">{r.reward.value}</Badge>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
            <Reveal delay={0.2}>
              <p className="mt-6 flex items-center justify-center gap-2 text-xs text-stone">
                <Copy className="size-3.5" aria-hidden />
                Show the code at the partner counter — each code is single-use and tied to your account.
              </p>
            </Reveal>
          </Container>
        </section>
      )}

      {/* Loop CTA */}
      <section className="bg-paper py-20 sm:py-24">
        <Container className="max-w-3xl text-center">
          <Reveal>
            <Coins className="mx-auto size-8 text-saffron-deep" aria-hidden />
            <h2 className="mt-5 font-display text-3xl tracking-tight text-ink sm:text-4xl">
              One check-in starts the loop.
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-[15px] leading-relaxed text-stone">
              RSVP to a restoration event, verify on site, and the stamps, points and rewards
              follow automatically — no honour system, no claiming.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <ButtonLink href="/events" size="lg">
                <HandHeart className="size-4" aria-hidden />
                Find an event
              </ButtonLink>
              <ButtonLink href="/impact" variant="outline-dark" size="lg">
                See the impact ledger
                <ArrowUpRight className="size-4" aria-hidden />
              </ButtonLink>
            </div>
          </Reveal>
        </Container>
      </section>
    </>
  );
}
