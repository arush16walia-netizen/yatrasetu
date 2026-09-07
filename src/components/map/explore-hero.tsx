"use client";

import { useMemo, useRef, useState } from "react";
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import { ArrowDown, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { Container } from "@/components/ui/container";
import { IndiaMapScene } from "@/components/map/india-map-scene";
import { Spotlight } from "@/components/map/spotlight";
import type { DestinationSummary } from "@/lib/queries";

/**
 * The explore hero: the full 3D map of India IS the background — tilting
 * with the pointer, every marker a clickable destination. The headline
 * overlays it and the featured Spotlight floats beside it, synced to the
 * marker selection.
 */
export function ExploreHero({ destinations }: { destinations: DestinationSummary[] }) {
  const reduce = useReducedMotion();
  const regionCount = new Set(destinations.map((d) => d.region)).size;
  const featuredCount = destinations.filter((d) => d.featured).length;
  const featured = useMemo(
    () =>
      destinations.some((d) => d.featured)
        ? destinations.filter((d) => d.featured)
        : destinations.slice(0, 5),
    [destinations],
  );
  const [activeId, setActiveId] = useState<string | null>(featured[0]?.id ?? null);

  // Scroll story: the map zooms toward you and dissolves as you leave the
  // hero — a fly-past transition into the catalog below.
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const mapScale = useTransform(scrollYProgress, [0, 1], [1, 1.38]);
  const mapY = useTransform(scrollYProgress, [0, 1], ["0%", "-7%"]);
  const mapOpacity = useTransform(scrollYProgress, [0, 0.14, 0.72], [1, 0.9, 0]);
  const [mapLive, setMapLive] = useState(true);
  useMotionValueEvent(mapOpacity, "change", (v) => setMapLive(v > 0.05));

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-[100svh] flex-col overflow-hidden bg-ink text-paper"
      aria-label="Discover India — interactive map"
    >
      {/* The map: full-bleed interactive background — zooms toward you and
          dissolves as the visitor scrolls on toward the catalog */}
      <div
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
        aria-hidden={reduce ? true : undefined}
      >
        <motion.div
          className="h-full w-full will-change-[transform,opacity]"
          style={reduce ? undefined : { scale: mapScale, y: mapY, opacity: mapOpacity }}
        >
          <div
            className={cn(
              "h-full max-h-[94svh] py-14",
              mapLive ? "pointer-events-auto" : "pointer-events-none",
            )}
          >
            <IndiaMapScene
              destinations={destinations}
              selectedId={activeId}
              onSelect={setActiveId}
              tone="night"
              showLegend={false}
              className="h-full [&>div]:h-full [&_svg]:h-full [&_svg]:w-auto"
            />
          </div>
        </motion.div>
      </div>

      {/* Legibility scrims — pointer-transparent, never block the pins */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-ink/85 via-ink/30 to-ink/60" aria-hidden />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-ink to-transparent" aria-hidden />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-ink/80 to-transparent" aria-hidden />

      {/* Content */}
      <Container className="relative flex flex-1 flex-col justify-end pb-14 pt-40 sm:pb-16">
        <div className="grid items-end gap-12 lg:grid-cols-[minmax(0,1fr)_400px]">
          <div>
            <motion.p
              className="eyebrow flex items-center gap-3 text-saffron"
              initial={reduce ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <span className="h-px w-10 bg-saffron/70" aria-hidden />
              Discover India
            </motion.p>
            <motion.h1
              className="mt-6 max-w-3xl font-display text-[clamp(2.8rem,7vw,6.5rem)] font-medium leading-[0.98] tracking-tight"
              initial={reduce ? false : { opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
            >
              The whole map of India.
              <br />
              <span className="text-paper/60 italic">Every place worth the journey.</span>
            </motion.h1>
            <motion.div
              className="mt-8 flex flex-wrap items-center gap-3 text-sm text-paper/75"
              initial={reduce ? false : { opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              <span className="inline-flex items-center gap-2">
                <MapPin className="size-4 text-saffron" aria-hidden />
                {destinations.length} destinations · {regionCount} states & regions
              </span>
              <span className="mx-1 hidden h-1 w-1 rounded-full bg-paper/40 sm:block" aria-hidden />
              <span>{featuredCount} glowing highlights — click any pin to meet it</span>
            </motion.div>
            <motion.div
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.9, delay: 0.5 }}
            >
              <a
                href="#search"
                className="group mt-10 inline-flex items-center gap-3 text-sm font-semibold text-paper/60 transition-colors hover:text-paper"
              >
                Begin the scroll
                <ArrowDown className="size-4 animate-bounce" aria-hidden />
              </a>
            </motion.div>
          </div>

          {/* Spotlight floats over the map, synced with the pins */}
          <motion.div
            className="hidden lg:block"
            initial={reduce ? false : { opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <Spotlight featured={featured} activeId={activeId} onSelect={setActiveId} />
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
