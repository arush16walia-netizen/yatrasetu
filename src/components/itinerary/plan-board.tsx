"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { CalendarDays, Clock3, GripVertical, MapPin, Trash2 } from "lucide-react";
import type { PlanItem } from "@/lib/itineraries";
import { formatDate } from "@/lib/utils";

type Props = { initialItems: PlanItem[] };

/**
 * The My Yatra board. Every action hits the real API and re-reads the plan —
 * nothing is client-only state. Reorder persists via PATCH, remove via DELETE.
 */
export function PlanBoard({ initialItems }: Props) {
  const [items, setItems] = useState(initialItems);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const reduce = useReducedMotion();

  function refresh() {
    startTransition(async () => {
      const res = await fetch("/api/itinerary", { cache: "no-store" });
      if (res.ok) {
        const plan = await res.json();
        setItems(plan.items);
      }
    });
  }

  async function remove(itemId: string) {
    setError(null);
    setItems((prev) => prev.filter((i) => i.id !== itemId));
    const res = await fetch(`/api/itinerary?itemId=${encodeURIComponent(itemId)}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(j.error ?? "Couldn't remove that stop.");
      refresh();
    }
  }

  /** Move an item within its day (position swap), then persist the new order. */
  async function move(item: PlanItem, dir: -1 | 1) {
    const sameDay = items
      .filter((i) => i.day === item.day)
      .sort((a, b) => a.position - b.position);
    const idx = sameDay.findIndex((i) => i.id === item.id);
    const swapWith = sameDay[idx + dir];
    if (!swapWith) return;

    const reordered = [...sameDay];
    reordered[idx] = swapWith;
    reordered[idx + dir] = item;

    const other = items.filter((i) => i.day !== item.day);
    const next = [...other, ...reordered];
    setItems(next);

    const res = await fetch("/api/itinerary", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderedIds: reordered.map((i) => i.id) }),
    });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(j.error ?? "Couldn't save the new order.");
      refresh();
    }
  }

  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-ink/15 p-10 text-center">
        <p className="font-display text-xl text-ink">An empty route.</p>
        <p className="mx-auto mt-2 max-w-sm text-sm text-stone">
          Add destinations and restoration events from the panel on the right — or from any
          destination or event page.
        </p>
      </div>
    );
  }

  const days = [...new Set(items.map((i) => i.day))].sort((a, b) => a - b);

  return (
    <div>
      {error && (
        <p role="alert" className="mb-4 rounded-md border border-error/30 bg-error/10 p-3 text-sm text-error">
          {error}
        </p>
      )}
      <div className="space-y-10">
        {days.map((day) => {
          const dayItems = items
            .filter((i) => i.day === day)
            .sort((a, b) => a.position - b.position);
          return (
            <div key={day}>
              <p className="eyebrow text-saffron-deep">Day {day}</p>
              <ul className="mt-3 space-y-3">
                <AnimatePresence initial={false}>
                  {dayItems.map((item) => {
                    const target = item.destination ?? item.event?.destination ?? null;
                    const title = item.destination?.name ?? item.event?.title ?? "Stop";
                    const href = item.destination
                      ? `/explore/${item.destination.slug}`
                      : item.event
                        ? `/events/${item.event.slug}`
                        : "#";
                    return (
                      <motion.li
                        key={item.id}
                        layout={reduce ? false : "position"}
                        initial={reduce ? false : { opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={reduce ? undefined : { opacity: 0, scale: 0.97 }}
                        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                        className="flex items-center gap-3 rounded-lg border border-ink/8 bg-paper-raised p-4 shadow-card sm:gap-4 sm:p-5"
                      >
                        <span
                          className="hidden cursor-grab touch-none text-stone/40 active:cursor-grabbing sm:block"
                          aria-hidden
                        >
                          <GripVertical className="size-4" />
                        </span>

                        {target?.image ? (
                          <span className="relative size-14 shrink-0 overflow-hidden rounded-md bg-ink/5">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={target.image}
                              alt=""
                              className="size-full object-cover"
                              loading="lazy"
                            />
                          </span>
                        ) : (
                          <span className="grid size-14 shrink-0 place-items-center rounded-md bg-saffron/12 text-saffron-deep">
                            {item.event ? <CalendarDays className="size-5" /> : <MapPin className="size-5" />}
                          </span>
                        )}

                        <div className="min-w-0 flex-1">
                          <p className="truncate font-display text-lg tracking-tight text-ink">
                            <Link href={href} className="hover:underline">
                              {title}
                            </Link>
                          </p>
                          <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-stone">
                            {target && <span>{target.region}</span>}
                            {item.event && (
                              <>
                                <span className="inline-flex items-center gap-1">
                                  <Clock3 className="size-3" aria-hidden />
                                  {item.event.startTime}
                                </span>
                                <span>{formatDate(item.event.date)}</span>
                              </>
                            )}
                            {item.destination && (
                              <span className="rounded-sm bg-verify/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-verify">
                                Destination
                              </span>
                            )}
                            {item.event && (
                              <span className="rounded-sm bg-saffron/12 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-saffron-deep">
                                Seva
                              </span>
                            )}
                          </p>
                        </div>

                        <div className="flex shrink-0 items-center gap-1">
                          <button
                            type="button"
                            onClick={() => move(item, -1)}
                            disabled={pending || dayItems.findIndex((i) => i.id === item.id) === 0}
                            aria-label={`Move ${title} earlier in day ${day}`}
                            className="grid size-8 place-items-center rounded-md border border-ink/10 text-stone transition-colors hover:border-ink/25 hover:text-ink disabled:opacity-30"
                          >
                            ↑
                          </button>
                          <button
                            type="button"
                            onClick={() => move(item, 1)}
                            disabled={
                              pending ||
                              dayItems.findIndex((i) => i.id === item.id) === dayItems.length - 1
                            }
                            aria-label={`Move ${title} later in day ${day}`}
                            className="grid size-8 place-items-center rounded-md border border-ink/10 text-stone transition-colors hover:border-ink/25 hover:text-ink disabled:opacity-30"
                          >
                            ↓
                          </button>
                          <button
                            type="button"
                            onClick={() => remove(item.id)}
                            disabled={pending}
                            aria-label={`Remove ${title} from your Yatra`}
                            className="grid size-8 place-items-center rounded-md border border-ink/10 text-stone transition-colors hover:border-error/40 hover:text-error disabled:opacity-30"
                          >
                            <Trash2 className="size-4" aria-hidden />
                          </button>
                        </div>
                      </motion.li>
                    );
                  })}
                </AnimatePresence>
              </ul>
            </div>
          );
        })}
      </div>
      <p className="mt-6 text-xs text-stone" aria-live="polite">
        {pending ? "Saving…" : "Changes save to your record instantly."}
      </p>
    </div>
  );
}
