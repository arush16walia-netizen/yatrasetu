"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring } from "motion/react";
import { cn } from "@/lib/utils";

const INTERACTIVE = "a, button, [role='button'], input, select, textarea, label, summary, [data-cursor]";

/**
 * Bespoke cursor: an instant dot with a trailing halo that swells over
 * interactive elements and morphs into a label pill when the hovered
 * element carries data-cursor-label (used by map markers etc.).
 * Touch devices and prefers-reduced-motion keep the native cursor.
 */
export function CustomCursor() {
  const reduce = useReducedMotion();
  const [enabled, setEnabled] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [label, setLabel] = useState<string | null>(null);
  const [pressed, setPressed] = useState(false);
  const [visible, setVisible] = useState(false);

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const dotX = useSpring(x, { stiffness: 1600, damping: 80, mass: 0.15 });
  const dotY = useSpring(y, { stiffness: 1600, damping: 80, mass: 0.15 });
  const haloX = useSpring(x, { stiffness: 260, damping: 26, mass: 0.6 });
  const haloY = useSpring(y, { stiffness: 260, damping: 26, mass: 0.6 });

  useEffect(() => {
    if (reduce) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;
    setEnabled(true);
    document.documentElement.classList.add("ys-cursor");

    const onMove = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      setVisible(true);

      const el = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null;
      if (el) {
        const hit = el.closest(INTERACTIVE) as HTMLElement | null;
        setHovering(Boolean(hit));
        const labelled = el.closest("[data-cursor-label]") as HTMLElement | null;
        setLabel(labelled?.dataset.cursorLabel ?? null);
      }
    };
    const onDown = () => setPressed(true);
    const onUp = () => setPressed(false);
    const onLeave = () => {
      setVisible(false);
      setHovering(false);
      setLabel(null);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    document.documentElement.addEventListener("pointerleave", onLeave);

    return () => {
      document.documentElement.classList.remove("ys-cursor");
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, [reduce, x, y]);

  if (!enabled) return null;

  return (
    <>
      {/* trailing halo / label pill */}
      <motion.div
        className="pointer-events-none fixed left-0 top-0 z-[200]"
        style={{ x: haloX, y: haloY, translateX: "-50%", translateY: "-50%" }}
        aria-hidden
      >
        <motion.div
          className={cn(
            "flex items-center justify-center rounded-full border transition-colors duration-300",
            label
              ? "border-saffron bg-ink px-4 py-1.5 text-paper"
              : hovering
                ? "border-saffron bg-saffron/10"
                : "border-ink/30 bg-transparent",
          )}
          animate={{
            scale: pressed ? 0.7 : label ? 1 : hovering ? 1.9 : 1,
            opacity: visible ? 1 : 0,
            width: label ? "auto" : 34,
            height: label ? "auto" : 34,
          }}
          transition={{ type: "spring", stiffness: 320, damping: 22 }}
        >
          <span
            className={cn(
              "whitespace-nowrap text-[10px] font-bold uppercase tracking-[0.18em] text-saffron transition-opacity duration-200",
              label ? "opacity-100" : "opacity-0",
            )}
          >
            {label}
          </span>
        </motion.div>
      </motion.div>

      {/* instant dot */}
      <motion.div
        className="pointer-events-none fixed left-0 top-0 z-[201]"
        style={{ x: dotX, y: dotY, translateX: "-50%", translateY: "-50%" }}
        aria-hidden
      >
        <motion.span
          className="block rounded-full bg-saffron shadow-[0_0_0_1px_rgba(255,255,255,0.6)]"
          animate={{
            width: pressed || hovering ? 6 : 9,
            height: pressed || hovering ? 6 : 9,
            opacity: visible ? 1 : 0,
          }}
          transition={{ type: "spring", stiffness: 600, damping: 30 }}
        />
      </motion.div>
    </>
  );
}