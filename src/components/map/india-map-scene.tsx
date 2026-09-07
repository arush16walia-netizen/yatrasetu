"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react";
import { INDIA_PATH } from "@/lib/india-map";
import type { DestinationSummary } from "@/lib/queries";
import { cn } from "@/lib/utils";

/**
 * A living map of India. The outline plane sits at translateZ(0); regular
 * destinations float above it, featured ones float higher with a glow.
 * The whole scene tilts toward the pointer (desktop, no reduced-motion),
 * and a soft light follows the cursor across the map.
 *
 * `tone` switches the appearance: "light" for the explore page, "night"
 * for dark/cinematic backdrops (hero). `hrefFor` turns markers into real
 * destination links instead of selection buttons.
 */
export function IndiaMapScene({
  destinations,
  selectedId,
  onSelect,
  hrefFor,
  tone = "light",
  showLegend = true,
  className,
}: {
  destinations: DestinationSummary[];
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  hrefFor?: (dest: DestinationSummary) => string;
  tone?: "light" | "night";
  showLegend?: boolean;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const wrapRef = useRef<HTMLDivElement>(null);
  const [fine, setFine] = useState(false);
  const marked = destinations.filter((d) => d.mapX != null && d.mapY != null);
  const night = tone === "night";

  // Yatra routes: quadratic arcs chaining the featured destinations in DB
  // order, lifted perpendicular to each leg so they read as flight paths
  // over the plane. Computed in the map's own coordinate space.
  const arcPaths = useMemo(() => {
    const VB_W = 666.67;
    const VB_H = 777.33;
    const featuredChain = marked.filter((d) => d.featured);
    if (featuredChain.length < 2) return [];
    const pts = featuredChain.map((d) => ({
      x: d.mapX! * VB_W,
      y: d.mapY! * VB_H,
    }));
    const arcs: string[] = [];
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i];
      const b = pts[i + 1];
      const mx = (a.x + b.x) / 2;
      const my = (a.y + b.y) / 2;
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const len = Math.hypot(dx, dy) || 1;
      const lift = Math.min(len * 0.22, 46);
      // perpendicular, consistently arcing "westward"
      const cx = mx - (dy / len) * lift;
      const cy = my + (dx / len) * lift;
      arcs.push(`M ${a.x} ${a.y} Q ${cx} ${cy} ${b.x} ${b.y}`);
    }
    return arcs;
  }, [marked]);

  useEffect(() => {
    if (reduce) return;
    if (window.matchMedia("(pointer: fine)").matches) setFine(true);
  }, [reduce]);

  const tiltable = fine && !reduce;

  // pointer tilt
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const rx = useSpring(useTransform(py, [-0.5, 0.5], [9, -9]), { stiffness: 120, damping: 18 });
  const ry = useSpring(useTransform(px, [-0.5, 0.5], [-11, 11]), { stiffness: 120, damping: 18 });

  // roaming light
  const lx = useSpring(px, { stiffness: 60, damping: 20 });
  const ly = useSpring(py, { stiffness: 60, damping: 20 });
  const lightX = useTransform(lx, [-0.5, 0.5], ["30%", "70%"]);
  const lightY = useTransform(ly, [-0.5, 0.5], ["25%", "75%"]);

  function handlePointer(e: React.PointerEvent) {
    if (reduce || e.pointerType !== "mouse") return;
    const rect = wrapRef.current?.getBoundingClientRect();
    if (!rect) return;
    px.set((e.clientX - rect.left) / rect.width - 0.5);
    py.set((e.clientY - rect.top) / rect.height - 0.5);
  }

  function resetTilt() {
    px.set(0);
    py.set(0);
  }

  return (
    <div
      ref={wrapRef}
      onPointerMove={handlePointer}
      onPointerLeave={resetTilt}
      className={cn("group/map relative select-none", className)}
      style={tiltable ? { perspective: 1400 } : undefined}
    >
      {/* tilt stage */}
      <motion.div
        className="relative h-full w-full"
        style={
          tiltable
            ? { rotateX: rx, rotateY: ry, transformStyle: "preserve-3d" }
            : undefined
        }
      >
        {/* map box — shrinks to the SVG's true box so every %-positioned
            layer (glow, light, markers) aligns exactly to the drawn map */}
        <div className="relative mx-auto h-full w-fit">
        {/* ground glow */}
        <motion.div
          aria-hidden
          className="absolute inset-[6%] rounded-[50%] bg-[radial-gradient(closest-side,rgba(230,81,0,0.26),rgba(0,77,64,0.14)_55%,transparent_75%)] blur-2xl"
          style={{ transform: "translateZ(-160px) scale(1.35)" }}
        />

        {/* roaming light */}
        {tiltable && (
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-70 mix-blend-soft-light"
            style={{
              transform: "translateZ(-70px)",
              background: "radial-gradient(340px circle at var(--lx,50%) var(--ly,50%), rgba(255,255,255,0.45), transparent 70%)",
              ["--lx" as string]: lightX,
              ["--ly" as string]: lightY,
            }}
          />
        )}

        {/* map plane */}
        <svg
          viewBox="0 0 666.66669 777.33331"
          className="block h-full w-auto drop-shadow-[0_30px_40px_rgba(11,15,23,0.18)]"
          style={{ transform: "translateZ(0px)" }}
          role="img"
          aria-label="Map of India showing Yatra Setu destinations"
        >
          <path
            d={INDIA_PATH}
            fill={night ? "var(--color-ink-raised)" : "var(--color-paper-raised)"}
            stroke={night ? "var(--color-paper)" : "var(--color-ink)"
            }
            strokeOpacity={night ? "0.22" : "0.32"}
            strokeWidth="3"
            strokeLinejoin="round"
          />
          {/* soft inner wash */}
          <path d={INDIA_PATH} fill="url(#mapSheen)" opacity="0.5" />
          <defs>
            <linearGradient id="mapSheen" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="rgba(230,81,0,0.16)" />
              <stop offset="55%" stopColor="rgba(230,81,0,0)" />
              <stop offset="100%" stopColor="rgba(0,77,64,0.14)" />
            </linearGradient>
          </defs>
          {/* yatra routes — subtle animated arcs between featured places */}
          <g aria-hidden>
            {arcPaths.map((d, i) => (
              <path
                key={i}
                d={d}
                fill="none"
                stroke="var(--color-saffron)"
                strokeOpacity={night ? 0.4 : 0.5}
                strokeWidth={1.6}
                strokeLinecap="round"
                strokeDasharray="3 7"
                className="ys-arc"
                style={{ animationDelay: `${i * -2.1}s` }}
              />
            ))}
          </g>
        </svg>

        {/* markers — buttons on explore (selection), links elsewhere */}
        {marked.map((dest, i) => {
          const isFeatured = dest.featured;
          const isSelected = dest.id === selectedId;
          const href = hrefFor ? hrefFor(dest) : undefined;
          const shared = {
            "data-cursor-label": isFeatured ? dest.name : undefined,
            "aria-label": `${dest.name}${isFeatured ? " (featured)" : ""}, ${dest.region} — view destination`,
            className: "absolute z-10 -translate-x-1/2 -translate-y-1/2 outline-offset-4",
            style: {
              left: `${dest.mapX! * 100}%`,
              top: `${dest.mapY! * 100}%`,
              transform: `translate(-50%,-50%) translateZ(${isFeatured ? 90 : 34}px)`,
            },
          };
          const inner = (
            <>
              {/* glow for featured */}
              {isFeatured && (
                <span
                  aria-hidden
                  className={cn(
                    "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-saffron/40 blur-md",
                    isSelected ? "animate-pulse-dot size-9" : "size-6",
                  )}
                />
              )}
              {/* pin */}
              <span
                className={cn(
                  "block rounded-full border-2 shadow-md transition-transform duration-300 ease-expo",
                  night ? "border-fog" : "border-paper",
                  isFeatured
                    ? night
                      ? "size-4 bg-saffron"
                      : "size-4 bg-saffron-deep"
                    : night
                      ? "size-2.5 bg-paper"
                      : "size-2.5 bg-teal",
                  isSelected ? "scale-[1.9] ring-2 ring-saffron/80" : "",
                )}
              />
              {/* index chip for featured */}
              {isFeatured && (
                <span
                  className={cn(
                    "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[9px] font-bold text-paper transition-opacity duration-300",
                    isSelected ? "opacity-0" : "opacity-0 group-hover/map:opacity-0",
                  )}
                >
                  {i + 1}
                </span>
              )}
              {/* name pill when selected */}
              {isSelected && (
                <span className="absolute left-1/2 top-full z-20 mt-1.5 -translate-x-1/2 whitespace-nowrap rounded-sm border border-saffron/40 bg-ink px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-saffron shadow-lift">
                  {dest.name.split(",")[0]}
                </span>
              )}
            </>
          );
          return href ? (
            <Link key={dest.slug} {...shared} href={href}>
              {inner}
            </Link>
          ) : (
            <button key={dest.slug} {...shared} type="button" aria-pressed={isSelected} onClick={() => onSelect?.(dest.id)}>
              {inner}
            </button>
          );
        })}
        </div>
      </motion.div>

      {/* caption */}
      {showLegend && (
        <div
          className={cn(
            "mt-5 flex flex-wrap items-center justify-between gap-3 text-[11px] uppercase tracking-[0.16em]",
            night ? "text-mist" : "text-stone",
          )}
        >
          <span className="flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-saffron-deep" aria-hidden /> Featured
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-teal" aria-hidden /> Every place to visit
            </span>
          </span>
          {tiltable && <span className="hidden sm:block">Move over the map · it follows you</span>}
        </div>
      )}
    </div>
  );
}