"use client";

import Image from "@/components/ui/image";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
} from "motion/react";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { Container } from "@/components/ui/container";
import { ButtonLink } from "@/components/ui/button";
import { Magnetic } from "@/components/ui/magnetic";
import { MapBackdrop } from "@/components/map/map-backdrop";
import type { DestinationSummary } from "@/lib/queries";

const HERO_IMAGE = "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=2400&auto=format&fit=crop";

export function Hero({ destinations }: { destinations: DestinationSummary[] }) {
  const reduce = useReducedMotion();
  const { scrollY } = useScroll();
  const bgY = useTransform(scrollY, [0, 900], [0, 240]);
  const contentY = useTransform(scrollY, [0, 700], [0, -90]);
  const fade = useTransform(scrollY, [0, 600], [1, 0]);

  return (
    <section
      className="relative flex min-h-[100svh] items-end overflow-hidden bg-ink text-paper"
      aria-label="Yatra Setu — travel that gives back"
    >
      {/* Background image with scroll parallax */}
      <motion.div
        className="absolute inset-0"
        style={reduce ? undefined : { y: bgY, scale: 1.08 }}
        aria-hidden
      >
        <Image
          src={HERO_IMAGE}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/55 to-ink/25" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/60 via-transparent to-transparent" />
      </motion.div>

      {/* The 3D India map — interactive backdrop, right-anchored */}
      <MapBackdrop destinations={destinations} />

      {/* Content */}
      <motion.div className="relative w-full" style={reduce ? undefined : { y: contentY, opacity: fade }}>
        <Container className="pb-24 pt-40 sm:pb-28 sm:pt-48">
          <motion.p
            className="eyebrow flex items-center gap-3 text-saffron"
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="h-px w-10 bg-saffron/70" aria-hidden />
            Yatra Setu · यात्रा बने सेवा
          </motion.p>

          <h1 className="mt-8 max-w-5xl font-display text-[clamp(3rem,8vw,7.5rem)] font-medium leading-[0.98] tracking-tight text-balance">
            <motion.span
              className="block"
              initial={reduce ? false : { opacity: 0, y: 48 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            >
              Travel farther.
            </motion.span>
            <motion.span
              className="block text-mist italic"
              initial={reduce ? false : { opacity: 0, y: 48 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.32, ease: [0.16, 1, 0.3, 1] }}
            >
              Leave something better behind.
            </motion.span>
          </h1>

          <motion.p
            className="mt-8 max-w-xl text-lg leading-relaxed text-paper/80"
            initial={reduce ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
          >
            India is not a place you visit. It is a place you become part of.
            Discover it, restore the places you love, and earn rewards that make
            your next journey lighter on the land.
          </motion.p>

          <motion.div
            className="mt-10 flex flex-wrap items-center gap-4"
            initial={reduce ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.72, ease: [0.16, 1, 0.3, 1] }}
          >
            <Magnetic>
              <ButtonLink href="/explore" size="lg">
                Explore Yatra
                <ArrowUpRight className="size-4" aria-hidden />
              </ButtonLink>
            </Magnetic>
            <Magnetic>
              <ButtonLink href="/events" variant="outline-light" size="lg">
                Join a restoration event
              </ButtonLink>
            </Magnetic>
          </motion.div>
        </Container>
      </motion.div>

      {/* Scroll cue */}
      <motion.div
        className="absolute bottom-7 left-1/2 hidden -translate-x-1/2 sm:block"
        style={{ opacity: fade }}
        aria-hidden
      >
        <motion.span
          className="flex flex-col items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-paper/50"
          animate={reduce ? undefined : { y: [0, 6, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        >
          Scroll
          <ArrowDown className="size-4" />
        </motion.span>
      </motion.div>
    </section>
  );
}