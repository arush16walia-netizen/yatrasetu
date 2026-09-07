"use client";

import { useEffect, useState } from "react";
import { Loader2, MapPin, Navigation, Search, Utensils } from "lucide-react";
import { cn } from "@/lib/utils";

type Place = {
  id: string;
  name: string;
  category: "stay" | "food" | "transport" | "attraction" | "locality";
  address: string;
};

const CATEGORY_LABEL: Record<Place["category"], string> = {
  stay: "Stay",
  food: "Eat",
  transport: "Transport",
  attraction: "See",
  locality: "Place",
};

const CATEGORY_ICON: Record<Place["category"], typeof Search> = {
  stay: MapPin,
  food: Utensils,
  transport: Navigation,
  attraction: Search,
  locality: MapPin,
};

export function PlaceSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Place[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 3) {
      setResults(null);
      setError(false);
      return;
    }
    const t = setTimeout(() => {
      setLoading(true);
      setError(false);
      fetch(`/api/places?q=${encodeURIComponent(q)}`)
        .then((r) => (r.ok ? r.json() : Promise.reject()))
        .then((d) => {
          setResults(d.places ?? []);
          setLoading(false);
        })
        .catch(() => {
          setError(true);
          setLoading(false);
        });
    }, 450);
    return () => clearTimeout(t);
  }, [query]);

  return (
    <div>
      <label className="relative block">
        <span className="sr-only">Search any place in India</span>
        <Search className="pointer-events-none absolute left-4 top-1/2 size-4.5 -translate-y-1/2 text-stone" aria-hidden />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search any place, stay, ghat or trail in India — mapped live…"
          className="w-full rounded-full border border-ink/12 bg-paper-raised py-4 pl-12 pr-5 text-[15px] text-ink shadow-card placeholder:text-stone/50 transition-all duration-300 focus:border-saffron-deep focus:outline-none focus:ring-2 focus:ring-saffron/30"
        />
        {loading && (
          <Loader2 className="absolute right-4 top-1/2 size-4 -translate-y-1/2 animate-spin text-stone" aria-hidden />
        )}
      </label>

      {results && (
        <div className="mt-4 overflow-hidden rounded-lg border border-ink/8 bg-paper-raised shadow-card">
          {results.length === 0 ? (
            <p className="p-6 text-sm text-stone">
              Nothing mapped under &ldquo;{query}&rdquo; — try a town, fort, ghat or beach name.
            </p>
          ) : (
            <ul className="divide-y divide-ink/6">
              {results.slice(0, 8).map((p) => {
                const PIcon = CATEGORY_ICON[p.category] ?? MapPin;
                return (
                  <li key={p.id} className="flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-saffron/6">
                    <PIcon className="size-4 shrink-0 text-saffron-deep" aria-hidden />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-ink">{p.name}</p>
                      {p.address && <p className="truncate text-xs text-stone">{p.address}</p>}
                    </div>
                    <span
                      className={cn(
                        "shrink-0 rounded-sm border border-ink/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-stone",
                      )}
                    >
                      {CATEGORY_LABEL[p.category]}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
          <p className="border-t border-ink/6 bg-paper px-5 py-2 text-[10px] text-stone">
            Live results from OpenStreetMap · India-bounded
          </p>
        </div>
      )}

      {error && (
        <p className="mt-4 rounded-md border border-error/30 bg-error/10 px-4 py-3 text-sm text-error">
          The map service didn&rsquo;t answer. Try again in a moment.
        </p>
      )}
    </div>
  );
}
