"use client";

import { useEffect, useState } from "react";
import { Calendar, MapPin, RefreshCw, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type PassEntry = {
  eventTitle: string;
  date: string;
  meetingPoint: string;
  destination: string;
  slug: string;
};

const CACHE_KEY = "yatra-setu-pass-v1";

/**
 * Offline Remote Pass storage: "Save to device" writes the upcoming yatra to
 * localStorage so the pass can be pulled up with zero network (airplane mode),
 * as long as the page itself is still in the browser cache. When the server
 * copy is empty (offline load), the cached copy is rendered instead.
 */
export function PassCache({ entries, signedIn }: { entries: PassEntry[]; signedIn: boolean }) {
  const [cached, setCached] = useState<PassEntry[] | null>(null);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (raw) {
        const data = JSON.parse(raw) as { entries: PassEntry[]; savedAt: string };
        setCached(data.entries);
        setSavedAt(data.savedAt);
      }
    } catch {
      // corrupt cache — ignore, live data rules
    }
  }, []);

  const shown = entries.length > 0 ? entries : cached ?? [];
  const isCached = entries.length === 0 && cached != null && cached.length > 0;

  function save() {
    const data = { entries, savedAt: new Date().toISOString() };
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(data));
      setCached(entries);
      setSavedAt(data.savedAt);
    } catch {
      // storage full/private — nothing to do
    }
  }

  return (
    <div className="rounded-3xl border border-ink/10 bg-paper p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-xl font-semibold text-ink">Your upcoming yatra</h2>
        {entries.length > 0 && (
          <Button size="sm" variant="outline-dark" onClick={save}>
            <Save className="size-4" aria-hidden /> Save to device
          </Button>
        )}
      </div>
      {savedAt && (
        <p className={cn("mt-1 flex items-center gap-1.5 text-xs", isCached ? "text-saffron-deep" : "text-stone")}>
          {isCached ? <RefreshCw className="size-3" aria-hidden /> : null}
          {isCached ? `Loaded from device cache — saved ${new Date(savedAt).toLocaleString()}` : `Device cache current · ${new Date(savedAt).toLocaleString()}`}
        </p>
      )}

      {shown.length === 0 ? (
        <p className="mt-4 rounded-2xl border border-dashed border-ink/15 px-5 py-6 text-sm text-stone">
          {signedIn
            ? "No upcoming RSVPs yet. RSVP to a restoration event and save the pass here before you lose signal."
            : "Sign in, RSVP to an event, then save the pass here — it survives with zero network."}
        </p>
      ) : (
        <ul className="mt-4 space-y-3">
          {shown.map((e) => (
            <li key={`${e.slug}-${e.date}`} className="flex items-start gap-3 rounded-2xl border border-ink/10 bg-white/60 px-4 py-3">
              <Calendar className="mt-0.5 size-4 text-teal" aria-hidden />
              <div>
                <p className="font-medium text-ink">{e.eventTitle}</p>
                <p className="text-sm text-stone">
                  {new Date(e.date).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })} · {e.destination}
                </p>
                <p className="mt-1 flex items-center gap-1 text-xs text-stone">
                  <MapPin className="size-3" aria-hidden /> {e.meetingPoint}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
