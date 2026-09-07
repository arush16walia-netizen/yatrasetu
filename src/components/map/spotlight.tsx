"use client";

import { useEffect, useState } from "react";
import Image from "@/components/ui/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowLeft, ArrowRight, ArrowUpRight, Star } from "lucide-react";
import type { DestinationSummary } from "@/lib/queries";

export function Spotlight({
  featured,
  activeId,
  onSelect,
}: {
  featured: DestinationSummary[];
  activeId: string | null;
  onSelect?: (id: string) => void;
}) {
  const reduce = useReducedMotion();
  const [paused, setPaused] = useState(false);
  const index = Math.max(
    0,
    featured.findIndex((d) => d.id === activeId),
  );
  const current = featured[index] ?? featured[0];
  const [shownId, setShownId] = useState(current?.id ?? null);

  // keep the card in sync when selection comes from the map
  useEffect(() => {
    if (current) setShownId(current.id);
  }, [current?.id, current]);

  // auto-advance
  useEffect(() => {
    if (reduce || paused || featured.length <= 1) return;
    const t = setInterval(() => {
      setShownId((prev) => {
        const i = featured.findIndex((d) => d.id === prev);
        return featured[(i + 1) % featured.length].id;
      });
    }, 6000);
    return () => clearInterval(t);
  }, [reduce, paused, featured]);

  // keep internal selection in sync upward so map highlights follow autoplay
  useEffect(() => {
    if (shownId && shownId !== activeId) onSelect?.(shownId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shownId]);

  const shown = featured.find((d) => d.id === shownId) ?? current;

  if (!shown) return null;
  const shownIndex = featured.findIndex((d) => d.id === shown.id);

  function step(dir: 1 | -1) {
    setShownId(featured[(shownIndex + dir + featured.length) % featured.length].id);
  }

  return (
    <div
      className="relative"
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <p className="eyebrow flex items-center gap-2 text-saffron-deep">
        <Star className="size-3.5 fill-current" aria-hidden />
        Featured — the highlights
      </p>

      <div className="relative mt-5 overflow-hidden rounded-lg shadow-lift">
        <div className="relative aspect-[4/3] overflow-hidden">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              key={shown.id}
              initial={reduce ? false : { opacity: 0, scale: 1.06 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={reduce ? undefined : { opacity: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0"
            >
              <Image
                src={shown.heroImage ?? shown.image}
                alt={shown.imageAlt}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 42vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/30 to-ink/10" />
            </motion.div>
          </AnimatePresence>

          {/* top meta */}
          <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4 sm:p-5">
            <span className="rounded-sm border border-white/20 bg-ink/40 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-saffron backdrop-blur-sm">
              {shown.region}
            </span>
            <span className="font-display text-3xl font-light text-white/30">
              {String(shownIndex + 1).padStart(2, "0")}
            </span>
          </div>

          {/* bottom content */}
          <div className="absolute inset-x-0 bottom-0 p-5 text-paper sm:p-6">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={shown.id}
                initial={reduce ? false : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? undefined : { opacity: 0, y: -8 }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              >
                <h3 className="font-display text-3xl tracking-tight sm:text-4xl">
                  {shown.name.split(",")[0]}
                  {shown.hindiName && (
                    <span className="ml-2.5 align-middle font-deva text-xl text-paper/70">
                      {shown.hindiName}
                    </span>
                  )}
                </h3>
                <p className="mt-1.5 font-display italic text-paper/75">{shown.tagline}</p>
                {shown.needsCare && (
                  <p className="mt-2 flex items-start gap-2 text-xs leading-relaxed text-paper/85">
                    <span className="mt-1 size-1.5 shrink-0 rounded-full bg-verify" aria-hidden />
                    {shown.needsCare}
                  </p>
                )}
                <div className="mt-4 flex items-center gap-4">
                  <Link
                    href={`/explore/${shown.slug}`}
                    className="inline-flex items-center gap-2 rounded-md bg-saffron px-5 py-2.5 text-xs font-bold text-white transition-colors duration-300 hover:bg-saffron-deep"
                  >
                    Enter {shown.name.split(",")[0]}
                    <ArrowUpRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </Link>
                  <span className="hidden text-[10px] uppercase tracking-[0.18em] text-paper/50 sm:block">
                    {shown.knownFor.slice(0, 2).join(" · ")}
                  </span>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* controls */}
        <div className="flex items-center justify-between gap-4 bg-paper-raised px-5 py-3.5">
          <div className="flex items-center gap-1.5">
            {featured.map((d, i) => (
              <button
                key={d.id}
                type="button"
                onClick={() => setShownId(d.id)}
                aria-label={`Show ${d.name}`}
                aria-current={i === shownIndex}
                className={
                  i === shownIndex
                    ? "h-1.5 w-6 rounded-full bg-saffron-deep transition-all duration-300"
                    : "h-1.5 w-1.5 rounded-full bg-ink/20 transition-all duration-300 hover:bg-ink/40"
                }
              />
            ))}
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => step(-1)}
              aria-label="Previous featured destination"
              className="grid size-8 place-items-center rounded-full border border-ink/12 text-ink transition-all duration-300 hover:border-saffron-deep hover:bg-saffron/10"
            >
              <ArrowLeft className="size-4" aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => step(1)}
              aria-label="Next featured destination"
              className="grid size-8 place-items-center rounded-full border border-ink/12 text-ink transition-all duration-300 hover:border-saffron-deep hover:bg-saffron/10"
            >
              <ArrowRight className="size-4" aria-hidden />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}