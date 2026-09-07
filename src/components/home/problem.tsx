"use client";

import {
  ArrowRight,
  Compass,
  Heart,
  Leaf,
  MapPin,
  Sparkles,
} from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

const PRINCIPLES = [
  {
    number: "01",
    icon: Compass,
    title: "Discover with intention",
    description:
      "Find places worth knowing without turning every hidden corner into another crowded checklist.",
  },
  {
    number: "02",
    icon: Heart,
    title: "Travel with respect",
    description:
      "Experience local culture, heritage and landscapes while respecting the communities that call them home.",
  },
  {
    number: "03",
    icon: Leaf,
    title: "Leave something better",
    description:
      "Make every journey count through responsible choices, local participation and meaningful conservation.",
  },
];

const PRESSURES = [
  "Sudden tourist influx",
  "Overcrowded heritage sites",
  "Waste & plastic pollution",
  "Pressure on local communities",
];

export function Problem() {
  const reduce = useReducedMotion();

  return (
    <section
      className="relative overflow-hidden bg-ink text-paper"
      aria-label="The problem with unmanaged tourism"
    >
      {/* Subtle background texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        aria-hidden
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.9)_0,transparent_28%),radial-gradient(circle_at_80%_70%,rgba(255,255,255,0.7)_0,transparent_25%)]" />
      </div>

      <Container className="relative py-24 sm:py-32 lg:py-40">
        {/* ─────────────────────────────────────────────
            INTRO
        ───────────────────────────────────────────── */}
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 24 }}
          whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="max-w-4xl"
        >
          <div className="flex items-center gap-3">
            <span className="eyebrow text-saffron">The challenge</span>
            <span
              className="h-px w-10 bg-saffron/50"
              aria-hidden
            />
          </div>

          <h2 className="mt-7 max-w-4xl font-display text-4xl leading-[1.02] tracking-tight text-balance sm:text-6xl lg:text-7xl">
            When a beautiful place
            <span className="text-saffron"> goes viral,</span>
            <br className="hidden sm:block" /> who protects it?
          </h2>

          <p className="mt-7 max-w-2xl text-lg leading-relaxed text-paper/65 sm:text-xl">
            Social media can turn an unknown destination into a must-visit
            landmark overnight. But when discovery happens faster than a place
            can handle, the very things people came to experience begin to
            suffer.
          </p>
        </motion.div>

        {/* ─────────────────────────────────────────────
            PRESSURE STATEMENT
        ───────────────────────────────────────────── */}
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 28 }}
          whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{
            duration: 0.7,
            delay: reduce ? 0 : 0.12,
            ease: "easeOut",
          }}
          className="mt-20 border-y border-paper/10"
        >
          <div className="grid lg:grid-cols-[1.1fr_0.9fr]">
            {/* Main statement */}
            <div className="border-b border-paper/10 py-10 lg:border-b-0 lg:border-r lg:pr-14 lg:py-14">
              <div className="flex items-start gap-4">
                <MapPin
                  className="mt-1 size-5 shrink-0 text-saffron"
                  aria-hidden
                />

                <div>
                  <p className="eyebrow text-paper/45">
                    The attention problem
                  </p>

                  <p className="mt-4 max-w-xl font-display text-2xl leading-tight tracking-tight sm:text-3xl">
                    One viral moment can bring thousands of visitors to a
                    place that was never prepared for them.
                  </p>
                </div>
              </div>
            </div>

            {/* Pressure list */}
            <div className="py-10 lg:pl-14 lg:py-14">
              <p className="eyebrow text-paper/45">
                What follows
              </p>

              <div className="mt-6 space-y-4">
                {PRESSURES.map((pressure, index) => (
                  <motion.div
                    key={pressure}
                    initial={
                      reduce
                        ? false
                        : {
                            opacity: 0,
                            x: 12,
                          }
                    }
                    whileInView={
                      reduce
                        ? undefined
                        : {
                            opacity: 1,
                            x: 0,
                          }
                    }
                    viewport={{ once: true }}
                    transition={{
                      duration: 0.45,
                      delay: reduce ? 0 : index * 0.07,
                    }}
                    className="flex items-center gap-4 border-b border-paper/10 pb-4"
                  >
                    <span className="font-mono text-xs text-saffron">
                      0{index + 1}
                    </span>

                    <span className="text-sm text-paper/75 sm:text-base">
                      {pressure}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* ─────────────────────────────────────────────
            THE YATRA SETU IDEA
        ───────────────────────────────────────────── */}
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 24 }}
          whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="mt-28 sm:mt-36"
        >
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
            <div>
              <div className="flex items-center gap-3">
                <Sparkles
                  className="size-4 text-saffron"
                  aria-hidden
                />
                <p className="eyebrow text-saffron">
                  The Yatra Setu idea
                </p>
              </div>

              <p className="mt-6 max-w-sm text-sm leading-relaxed text-paper/45">
                Tourism does not have to be a choice between seeing a place
                and protecting it.
              </p>
            </div>

            <div>
              <h3 className="max-w-3xl font-display text-3xl leading-[1.08] tracking-tight text-balance sm:text-5xl">
                What if discovering India could also mean{" "}
                <span className="text-saffron">caring for it?</span>
              </h3>

              <p className="mt-6 max-w-2xl text-base leading-relaxed text-paper/60 sm:text-lg">
                Yatra Setu connects discovery with responsibility — helping
                travellers find meaningful experiences while encouraging
                choices that respect destinations, communities and the
                environment.
              </p>
            </div>
          </div>
        </motion.div>

        {/* ─────────────────────────────────────────────
            PRINCIPLES
        ───────────────────────────────────────────── */}
        <div className="mt-16 grid gap-px overflow-hidden rounded-xl border border-paper/10 bg-paper/10 md:grid-cols-3">
          {PRINCIPLES.map((principle, index) => {
            const Icon = principle.icon;

            return (
              <motion.article
                key={principle.number}
                initial={
                  reduce
                    ? false
                    : {
                        opacity: 0,
                        y: 24,
                      }
                }
                whileInView={
                  reduce
                    ? undefined
                    : {
                        opacity: 1,
                        y: 0,
                      }
                }
                viewport={{ once: true, amount: 0.15 }}
                transition={{
                  duration: 0.6,
                  delay: reduce ? 0 : index * 0.1,
                  ease: "easeOut",
                }}
                className="group relative bg-ink p-7 transition-colors duration-300 hover:bg-paper/[0.045] sm:p-9"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-saffron">
                    {principle.number}
                  </span>

                  <Icon
                    className="size-5 text-paper/30 transition-colors duration-300 group-hover:text-saffron"
                    aria-hidden
                  />
                </div>

                <h4 className="mt-14 font-display text-2xl tracking-tight">
                  {principle.title}
                </h4>

                <p className="mt-4 text-sm leading-relaxed text-paper/50">
                  {principle.description}
                </p>

                <div
                  className="mt-10 h-px w-8 bg-saffron/60 transition-all duration-300 group-hover:w-16"
                  aria-hidden
                />
              </motion.article>
            );
          })}
        </div>

        {/* ─────────────────────────────────────────────
            CLOSING STATEMENT
        ───────────────────────────────────────────── */}
        <motion.div
  initial={reduce ? false : { opacity: 0, y: 24 }}
  whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
  viewport={{ once: true, amount: 0.3 }}
  transition={{ duration: 0.7, ease: "easeOut" }}
  className="mt-24 flex flex-col gap-8 border-t border-paper/10 pt-10 sm:mt-32 sm:flex-row sm:items-end sm:justify-between"
>
  <div>
    <p className="eyebrow text-paper/40">
      Our belief
    </p>

    <p className="mt-4 max-w-xl font-display text-2xl leading-tight tracking-tight sm:text-3xl">
      A journey should leave memories behind —{" "}
      <span className="text-saffron">
        not damage.
      </span>
    </p>

    <p className="mt-5 font-display text-lg text-paper/45">
      Yatra bane seva
      <span className="mx-2 text-saffron">/</span>
      Let the journey become service.
    </p>
  </div>

  <ButtonLink
    href="/vision"
    size="sm"
    className="w-fit border border-paper/30 bg-transparent text-paper hover:bg-paper hover:text-ink"
  >
    Discover the vision
    <ArrowRight className="size-4" aria-hidden />
  </ButtonLink>
</motion.div>
      </Container>
    </section>
  );
}