"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Compass, HandHeart, MapPin, Search, Star } from "lucide-react";
import { cn } from "@/lib/utils";

type Hit = {
  type: "destination" | "event" | "stay" | "itinerary";
  title: string;
  subtitle: string;
  href: string;
};

const TYPE_META: Record<Hit["type"], { label: string; icon: typeof MapPin }> = {
  destination: { label: "Destination", icon: MapPin },
  event: { label: "Seva", icon: HandHeart },
  stay: { label: "Stay", icon: Star },
  itinerary: { label: "Itinerary", icon: Compass },
};

export function SearchDialog({ variant = "dark" }: { variant?: "dark" | "light" }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<Hit[]>([]);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const reduce = useReducedMotion();

  // ⌘K / Ctrl+K toggles the dialog.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (open) {
      const t = setTimeout(() => inputRef.current?.focus(), 60);
      return () => clearTimeout(t);
    }
    setQ("");
    setHits([]);
    setActive(0);
  }, [open]);

  // Debounced real search against /api/search.
  useEffect(() => {
    if (!open) return;
    const term = q.trim();
    if (term.length < 2) {
      setHits([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(term)}`);
        const j = await res.json();
        setHits(j.hits ?? []);
        setActive(0);
      } catch {
        setHits([]);
      } finally {
        setLoading(false);
      }
    }, 220);
    return () => clearTimeout(t);
  }, [q, open]);

  const go = useCallback(
    (href: string) => {
      setOpen(false);
      router.push(href);
    },
    [router],
  );

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, hits.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter" && hits[active]) {
      e.preventDefault();
      go(hits[active].href);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Search destinations, events and stays"
        className={cn(
          "hidden items-center gap-2.5 rounded-md border px-3.5 py-2 text-sm transition-colors duration-300 sm:flex",
          variant === "dark"
            ? "border-paper/25 text-paper/80 hover:border-paper/50 hover:text-paper"
            : "border-ink/12 text-stone hover:border-ink/30 hover:text-ink",
        )}
      >
        <Search className="size-4" aria-hidden />
        <span className="hidden md:inline">Search…</span>
        <kbd className="hidden rounded border border-paper/25 px-1.5 font-mono text-[10px] md:inline">
          ⌘K
        </kbd>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[80] flex items-start justify-center bg-ink/60 px-4 pt-[14vh] backdrop-blur-sm"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduce ? undefined : { opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={() => setOpen(false)}
            role="dialog"
            aria-modal="true"
            aria-label="Search"
          >
            <motion.div
              className="w-full max-w-xl overflow-hidden rounded-lg border border-ink/10 bg-paper shadow-lift"
              initial={reduce ? false : { opacity: 0, y: -16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={reduce ? undefined : { opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 border-b border-ink/8 px-5 py-4">
                <Search className="size-4 shrink-0 text-stone" aria-hidden />
                <input
                  ref={inputRef}
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  onKeyDown={onKeyDown}
                  placeholder="Search destinations, seva events, stays…"
                  aria-label="Search query"
                  className="w-full bg-transparent text-[15px] text-ink outline-none placeholder:text-stone/60"
                />
                <kbd className="rounded border border-ink/15 px-1.5 font-mono text-[10px] text-stone">
                  esc
                </kbd>
              </div>

              <div className="max-h-[52vh] overflow-y-auto p-2" role="listbox" aria-label="Results">
                {q.trim().length < 2 && (
                  <p className="px-4 py-8 text-center text-sm text-stone">
                    Type a place, an event, a stay — the whole ledger is searchable.
                  </p>
                )}
                {q.trim().length >= 2 && loading && hits.length === 0 && (
                  <div className="space-y-2 p-3" aria-hidden>
                    {[0, 1, 2].map((i) => (
                      <div key={i} className="h-14 animate-pulse rounded-md bg-ink/5" />
                    ))}
                  </div>
                )}
                {!loading && q.trim().length >= 2 && hits.length === 0 && (
                  <p className="px-4 py-8 text-center text-sm text-stone">
                    Nothing for “{q.trim()}” yet — try a region like <em>Kerala</em> or an event
                    like <em>cleanup</em>.
                  </p>
                )}
                {hits.map((hit, i) => {
                  const meta = TYPE_META[hit.type];
                  const Icon = meta.icon;
                  return (
                    <button
                      key={`${hit.href}-${i}`}
                      type="button"
                      role="option"
                      aria-selected={i === active}
                      onMouseEnter={() => setActive(i)}
                      onClick={() => go(hit.href)}
                      className={cn(
                        "flex w-full items-center gap-3.5 rounded-md px-3.5 py-3 text-left transition-colors",
                        i === active ? "bg-saffron/10" : "hover:bg-ink/4",
                      )}
                    >
                      <span
                        className={cn(
                          "grid size-9 shrink-0 place-items-center rounded-full border",
                          i === active
                            ? "border-saffron/40 bg-saffron/12 text-saffron-deep"
                            : "border-ink/10 bg-paper text-stone",
                        )}
                      >
                        <Icon className="size-4" aria-hidden />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-ink">
                          {hit.title}
                        </span>
                        <span className="block truncate text-xs text-stone">{hit.subtitle}</span>
                      </span>
                      <span className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.14em] text-stone">
                        {meta.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
