"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "motion/react";
import { IndiaMapScene } from "@/components/map/india-map-scene";
import type { DestinationSummary } from "@/lib/queries";

/**
 * The 3D India map as a cinematic hero backdrop. It sits behind the hero
 * content (pointer-events pass through except on the markers themselves),
 * tilts with the pointer, drifts up + fades as the visitor scrolls away.
 */
export function MapBackdrop({
  destinations,
}: {
  destinations: DestinationSummary[];
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "-14%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.85], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.06]);

  return (
    <div
      ref={ref}
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden={reduce ? true : undefined}
    >
      <motion.div className="absolute inset-0" style={reduce ? undefined : { y, opacity, scale }}>
        {/* right-anchored column so the map sits beside the headline, not under it */}
        <div className="absolute inset-y-0 right-[-6%] w-[min(62vw,760px)] opacity-[0.55] sm:opacity-60 lg:right-[4%] lg:w-[min(44vw,620px)] lg:opacity-90">
          <div className="pointer-events-none h-full lg:pointer-events-auto">
            <IndiaMapScene
              destinations={destinations}
              hrefFor={(d) => `/explore/${d.slug}`}
              tone="night"
              showLegend={false}
              className="h-full [&>div]:h-full [&_svg]:h-full [&_svg]:w-auto"
            />
          </div>
        </div>
      </motion.div>

      {/* legibility scrims — never over the markers, only over the seams */}
      <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/40 to-transparent lg:via-transparent" aria-hidden />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-ink to-transparent" aria-hidden />
    </div>
  );
}
