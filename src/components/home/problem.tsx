"use client";

import { useRef, useState } from "react";
import { ArrowRight, MoveHorizontal } from "lucide-react";
import Image from "@/components/ui/image";
import { ButtonLink } from "@/components/ui/button";
import type { MotionValue } from "motion/react";
import {
  motion,
  useMotionValueEvent,
  useScroll,
  useTransform,
  useReducedMotion,
} from "motion/react";
import { Container } from "@/components/ui/container";
import { PROBLEM_IMAGE, CROWD } from "./crowd";

const PHASES = [
  {
    label: "A beautiful place",
    line: "Somewhere in India, a cove, a lake, a lane of temples stays quiet. Loved by the few who find it.",
    note: "01 — undiscovered",
  },
  {
    label: "goes viral",
    line: "One reel. One post. A million thumb-stops. The same place is suddenly on everyone's list.",
    note: "02 — discovered",
  },
  {
    label: "and the love gets heavy.",
    line: "More feet than the shore can hold. Plastic that outlives the waves. A place loved to its limit.",
    note: "03 — pressured",
  },
];

/** One crowd dot; fades in once the crowd count crosses its index. */
function DensityDot({
  progress,
  index,
  reduce,
}: {
  progress: MotionValue<number>;
  index: number;
  reduce: boolean | null;
}) {
  const dot = CROWD[index];
  const opacity: MotionValue<number> = useTransform(progress, (v): number =>
    reduce ? 0.3 : v >= index ? dot.o : 0,
  );
  return (
    <circle
      cx={`${dot.x}%`}
      cy={`${dot.y}%`}
      r={dot.r}
      fill="#0B0F17"
      style={{ opacity } as unknown as React.CSSProperties}
    />
  );
}

/** Live counter driven by the crowd MotionValue — the number the dots represent. */
function Counter({ value }: { value: MotionValue<number> }) {
  const [n, setN] = useState(4);
  useMotionValueEvent(value, "change", (v) => setN(Math.round(v)));
  return <>{n}</>;
}

/** One story phase in the shared grid stack — hooks live here, not in a loop. */
function PhaseBlock({
  phase,
  index,
  phaseIndex,
  reduce,
}: {
  phase: (typeof PHASES)[number];
  index: number;
  phaseIndex: MotionValue<number>;
  reduce: boolean | null;
}) {
  const opacity = useTransform(phaseIndex, (v) => Math.max(0, 1 - Math.abs(v - index) * 2.2));
  const y = useTransform(phaseIndex, (v) => (v - index) * 40);

  return (
    <motion.div
      className="[grid-area:1/1]"
      style={
        reduce
          ? { display: index === 0 ? "block" : "none" }
          : { opacity, y }
      }
    >
      <h2 className="font-display text-4xl leading-[1.08] tracking-tight text-balance sm:text-5xl">
        {phase.label}
      </h2>
      <p className="mt-4 max-w-md text-lg leading-relaxed text-stone">{phase.line}</p>
      <p className="eyebrow mt-6 text-stone">{phase.note}</p>
    </motion.div>
  );
}

/**
 * Before/after slider: the SAME photograph on both sides of a draggable
 * divider. "Before" is the untouched shore; "after" carries the damage tint
 * and the full 64-person crowd from the shared formation data. Keyboard
 * accessible (arrow keys), pointer + touch drag, reduced-motion safe.
 */
function BeforeAfter() {
  const reduce = useReducedMotion();
  const boxRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState(62); // divider position, % from left
  const [dragging, setDragging] = useState(false);

  const setFromClientX = (clientX: number) => {
    const box = boxRef.current?.getBoundingClientRect();
    if (!box) return;
    const pct = ((clientX - box.left) / box.width) * 100;
    setPos(Math.min(96, Math.max(4, pct)));
  };

  const onPointerDown = (e: React.PointerEvent) => {
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    setDragging(true);
    setFromClientX(e.clientX);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (dragging) setFromClientX(e.clientX);
  };
  const stop = () => setDragging(false);

  const onKeyDown = (e: React.KeyboardEvent) => {
    const step = e.shiftKey ? 8 : 2;
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      setPos((p) => Math.max(4, p - step));
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      setPos((p) => Math.min(96, p + step));
    } else if (e.key === "Home") {
      e.preventDefault();
      setPos(4);
    } else if (e.key === "End") {
      e.preventDefault();
      setPos(96);
    }
  };

  return (
    <div
      ref={boxRef}
      className="relative aspect-[4/5] cursor-ew-resize touch-none select-none overflow-hidden rounded-lg shadow-lift"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={stop}
      onPointerCancel={stop}
    >
      {/* BEFORE — the quiet shore (base layer, full width) */}
      <Image
        src={PROBLEM_IMAGE}
        alt="A quiet backwater before crowds arrived — still water, an empty wooden boat"
        fill
        sizes="(max-width: 1024px) 100vw, 50vw"
        className="object-cover"
      />

      {/* AFTER — the same shore under pressure, clipped to the divider */}
      <div
        className="absolute inset-0"
        style={{ clipPath: `inset(0 0 0 ${pos}%)` }}
        aria-hidden
      >
        <Image
          src={PROBLEM_IMAGE}
          alt=""
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover"
        />
        {/* damage tint */}
        <div className="absolute inset-0 bg-[#4a3a1e] opacity-40 mix-blend-multiply" />
        {/* the full crowd — every formation, all at once */}
        <svg className="absolute inset-0 size-full" aria-hidden>
          {CROWD.map((dot, i) => (
            <circle
              key={i}
              cx={`${dot.x}%`}
              cy={`${dot.y}%`}
              r={dot.r}
              fill="#0B0F17"
              opacity={dot.o}
            />
          ))}
        </svg>
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/60 to-transparent p-5">
          <p className="eyebrow text-saffron">After · the crowd arrived</p>
        </div>
      </div>

      {/* the divider */}
      <div
        className="absolute inset-y-0 z-10 w-px bg-paper/90 shadow-[0_0_12px_rgba(0,0,0,0.45)]"
        style={{ left: `${pos}%` }}
        aria-hidden
      />
      {/* drag handle — also the keyboard focus point */}
      <button
        type="button"
        className="absolute top-1/2 z-20 grid size-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-paper/40 bg-ink/70 text-paper backdrop-blur-sm transition-transform duration-200 hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-saffron disabled:cursor-not-allowed"
        style={{ left: `${pos}%` }}
        onPointerDown={onPointerDown}
        onKeyDown={onKeyDown}
        aria-label="Comparison slider — reveal the crowded shore. Use left and right arrow keys to move."
        aria-valuenow={Math.round(pos)}
        aria-valuemin={4}
        aria-valuemax={96}
        role="slider"
      >
        <MoveHorizontal className="size-5" aria-hidden />
      </button>

      {/* BEFORE label — visible on the left side */}
      <div className="pointer-events-none absolute left-5 top-5 z-10">
        <p className="eyebrow rounded-sm border border-paper/20 bg-ink/55 px-3 py-1.5 text-paper/90 backdrop-blur-sm">
          Before · the quiet shore
        </p>
      </div>

      {!reduce && (
        <motion.div
          className="pointer-events-none absolute inset-0 rounded-lg ring-1 ring-inset ring-paper/10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
          aria-hidden
        />
      )}
    </div>
  );
}

export function Problem() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const phaseIndex = useTransform(scrollYProgress, [0.05, 0.4, 0.72], [0, 1, 2]);
  const progress = useTransform(scrollYProgress, [0.05, 1], [0, 100]);

  return (
    <section className="bg-paper" ref={ref} aria-label="The problem with unmanaged tourism">
      <div className="relative h-[260vh] sm:h-[300vh]">
        <div className="sticky top-0 flex h-screen items-center overflow-hidden">
          <Container className="grid gap-10 lg:grid-cols-2 lg:items-center">
            {/* Story text */}
            <div className="order-2 lg:order-1">
              <p className="eyebrow text-saffron-deep">The problem</p>
              <div className="mt-6 grid">
                {PHASES.map((phase, i) => (
                  <PhaseBlock
                    key={phase.label}
                    phase={phase}
                    index={i}
                    phaseIndex={phaseIndex}
                    reduce={reduce}
                  />
                ))}
              </div>
              <div className="mt-10 h-px w-full max-w-md bg-ink/10" aria-hidden>
                <motion.div className="h-full bg-saffron-deep" style={{ width: progress }} />
              </div>
              <ButtonLink href="/vision" variant="outline-dark" size="sm" className="mt-8 w-fit">
                Read the problem &amp; vision
                <ArrowRight className="size-4" aria-hidden />
              </ButtonLink>
            </div>

            {/* Visual: before/after slider — same place, heavier love */}
            <BeforeAfter />
          </Container>
        </div>
      </div>
    </section>
  );
}
