"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

type DestinationOption = { id: string; name: string; region: string };
type EventOption = { id: string; title: string; destination: string; date: string };

/**
 * Add-to-Yatra control. Posts to the real /api/itinerary endpoint — the server
 * validates the target, dedupes and persists. The optimistic UI rolls back on
 * failure, so the button never lies.
 */
export function AddToPlan({
  destinations,
  events,
  compact = false,
}: {
  destinations: DestinationOption[];
  events: EventOption[];
  compact?: boolean;
}) {
  const [added, setAdded] = useState<Record<string, "ok" | "error">>({});
  const [pending, startTransition] = useTransition();

  async function add(kind: "destination" | "event", id: string) {
    const body =
      kind === "destination" ? { destinationId: id } : { eventId: id };
    const res = await fetch("/api/itinerary", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const j = await res.json().catch(() => ({}));
    setAdded((prev) => ({ ...prev, [id]: res.ok ? "ok" : "error" }));
    if (!res.ok) console.error(j.error ?? "Add failed");
  }

  return (
    <div className={cn("space-y-4", compact && "space-y-2")}>
      {!compact && (
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-stone">
            Destinations
          </p>
          <ul className="mt-2 space-y-1.5">
            {destinations.map((d) => (
              <li key={d.id}>
                <button
                  type="button"
                  onClick={() => startTransition(() => add("destination", d.id))}
                  disabled={added[d.id] === "ok" || pending}
                  className="flex w-full items-center justify-between gap-3 rounded-md border border-ink/10 px-3.5 py-2.5 text-left text-sm transition-colors hover:border-saffron-deep hover:bg-saffron/8 disabled:cursor-default disabled:border-verify/30 disabled:bg-verify/8"
                >
                  <span className="min-w-0">
                    <span className="font-medium text-ink">{d.name}</span>
                    <span className="ml-2 text-xs text-stone">{d.region}</span>
                  </span>
                  {added[d.id] === "ok" ? (
                    <span className="text-xs font-semibold text-verify">Added ✓</span>
                  ) : (
                    <Plus className="size-4 shrink-0 text-stone" aria-hidden />
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div>
        {!compact && (
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-stone">
            Upcoming seva
          </p>
        )}
        <ul className={cn(!compact && "mt-2 space-y-1.5", compact && "space-y-1.5")}>
          {events.map((e) => (
            <li key={e.id}>
              <button
                type="button"
                onClick={() => startTransition(() => add("event", e.id))}
                disabled={added[e.id] === "ok" || pending}
                className="flex w-full items-center justify-between gap-3 rounded-md border border-ink/10 px-3.5 py-2.5 text-left text-sm transition-colors hover:border-saffron-deep hover:bg-saffron/8 disabled:cursor-default disabled:border-verify/30 disabled:bg-verify/8"
              >
                <span className="min-w-0">
                  <span className="font-medium text-ink">{e.title}</span>
                  <span className="ml-2 text-xs text-stone">
                    {e.destination} · {new Date(e.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                  </span>
                </span>
                {added[e.id] === "ok" ? (
                  <span className="text-xs font-semibold text-verify">Added ✓</span>
                ) : (
                  <Plus className="size-4 shrink-0 text-stone" aria-hidden />
                )}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
