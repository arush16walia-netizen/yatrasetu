"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "motion/react";
import {
  Compass,
  CalendarCheck,
  Footprints,
  ScanLine,
  ShieldCheck,
  Stamp as StampIcon,
  Gift,
} from "lucide-react";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/ui/reveal";

const STEPS = [
  { icon: Compass, title: "Discover", line: "Find a place — and the restoration event woven into it." },
  { icon: CalendarCheck, title: "RSVP", line: "Reserve your spot at an event run by verified community leads." },
  { icon: Footprints, title: "Arrive", line: "Show up at the meeting point. Bring yourself; the rest is provided." },
  { icon: ScanLine, title: "Scan the QR", line: "At the site, scan the event code with your phone." },
  { icon: ShieldCheck, title: "Get verified", line: "Timestamp + location are captured. Your contribution is now real, on record." },
  { icon: StampIcon, title: "Earn a stamp", line: "A collectible stamp lands in your Yatra Passport." },
  { icon: Gift, title: "Redeem a reward", line: "Stamps turn into discounts — making your next journey lighter to afford." },
];

export function ImpactJourney() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 70%", "end 60%"],
  });
  const lineScale = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <section className="bg-ink py-24 text-paper sm:py-32" ref={ref} aria-label="How the impact journey works">
      <Container className="max-w-3xl">
        <SectionHeading
          tone="dark"
          align="center"
          eyebrow="The impact journey"
          title="Seven moves between visit and meaning."
          lede="Every step is designed to be easy. Only one of them requires your hands — the rest, the system handles."
        />

        <div className="relative mt-16">
          {/* spine */}
          <div className="absolute bottom-4 left-[27px] top-0 w-px bg-paper/10" aria-hidden>
            <motion.div
              className="h-full w-full origin-top bg-gradient-to-b from-saffron to-verify"
              style={reduce ? { transform: "scaleY(1)" } : { scaleY: lineScale }}
            />
          </div>

          <ol className="space-y-10">
            {STEPS.map((step, i) => (
              <Reveal key={step.title} delay={0.05} as="li" className="relative">
                <div className="flex gap-6">
                  <div className="relative z-10 shrink-0">
                    <div className="grid size-[54px] place-items-center rounded-full border border-paper/15 bg-ink-raised text-saffron shadow-lift transition-colors duration-500">
                      <step.icon className="size-5" aria-hidden />
                    </div>
                  </div>
                  <div className="pt-1.5">
                    <p className="eyebrow text-saffron/80">Step {String(i + 1).padStart(2, "0")}</p>
                    <h3 className="mt-1.5 font-display text-2xl tracking-tight">{step.title}</h3>
                    <p className="mt-1.5 max-w-md text-[15px] leading-relaxed text-mist">{step.line}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </Container>
    </section>
  );
}