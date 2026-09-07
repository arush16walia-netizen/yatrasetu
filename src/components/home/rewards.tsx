import { ArrowUpRight } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import {
  Anchor,
  Gift,
  Link2,
  Mountain,
  ShieldCheck,
  Sparkles,
  Sunrise,
  Trees,
  Waves,
} from "lucide-react";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/ui/reveal";
import { formatINR } from "@/lib/utils";
import type { Reward, Stamp } from "@/generated/prisma/client";

const ICONS: Record<string, typeof Sparkles> = {
  ShieldCheck,
  Waves,
  Mountain,
  Trees,
  Anchor,
  Sunrise,
  Link2,
};

export function Rewards({ stamps, rewards }: { stamps: Stamp[]; rewards: Reward[] }) {
  return (
    <section className="bg-paper-soft py-24 sm:py-32" aria-label="Stamps and rewards">
      <Container>
        <SectionHeading
          align="center"
          eyebrow="The reward system"
          title={
            <>
              Help restore places.
              <br />
              <span className="text-stone italic">Collect India&rsquo;s most honest souvenir.</span>
            </>
          }
          lede="Every verified contribution earns a stamp. Stamps unlock rewards that make your next journey cheaper, better, and lighter on the land."
        />

        {/* Stamps */}
        <div className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-7">
          {stamps.map((stamp, i) => {
            const Icon = ICONS[stamp.icon] ?? Sparkles;
            return (
              <Reveal key={stamp.code} delay={i * 0.07}>
                <div className="group flex flex-col items-center rounded-lg border border-ink/8 bg-paper-raised px-3 py-6 text-center shadow-card transition-colors duration-300 hover:border-saffron/40">
                  <span
                    className="grid size-16 place-items-center rounded-full border-2 border-dashed transition-all duration-500 group-hover:border-solid"
                    style={{ borderColor: stamp.color ?? "#E65100", color: stamp.color ?? "#C44400" }}
                    aria-hidden
                  >
                    <Icon className="size-7" strokeWidth={1.5} />
                  </span>
                  <p className="mt-4 text-sm font-semibold text-ink">{stamp.name}</p>
                  <p className="mt-0.5 font-deva text-xs text-stone">{stamp.nameHindi}</p>
                  <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-stone">
                    Tier {stamp.tier}
                  </p>
                </div>
              </Reveal>
            );
          })}
        </div>

        {/* Rewards */}
        <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {rewards.slice(0, 3).map((reward, i) => (
            <Reveal key={reward.code} delay={i * 0.1}>
              <div className="flex h-full flex-col justify-between rounded-lg border border-ink/8 bg-paper-raised p-7 shadow-card transition-colors duration-300 hover:border-saffron/40">
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
                <div className="mt-6 flex items-center justify-between border-t border-ink/8 pt-4">
                  <p className="text-xs text-stone">{reward.partner}</p>
                  <p className="text-sm font-bold text-verify">{reward.value}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.3}>
          <p className="mt-10 text-center">
            <ButtonLink href="/rewards" variant="outline-dark" size="md">
              See all stamps & rewards
              <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </ButtonLink>
          </p>
        </Reveal>
      </Container>
    </section>
  );
}