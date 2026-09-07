"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, CalendarCheck2, Loader2, LogIn, ShieldCheck, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";

export function RsvpPanel({
  eventId,
  eventSlug,
  capacity,
  confirmedCount: initialCount,
  status,
  eventDate,
  signedIn,
  initialRsvp,
}: {
  eventId: string;
  eventSlug: string;
  capacity: number;
  confirmedCount: number;
  status: string;
  eventDate: Date;
  signedIn: boolean;
  initialRsvp: "CONFIRMED" | "ATTENDED" | "CANCELLED" | null;
}) {
  const router = useRouter();
  const [count, setCount] = useState(initialCount);
  const [rsvp, setRsvp] = useState(initialRsvp);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isPast = new Date(eventDate) < new Date();
  const isToday = new Date(eventDate).toDateString() === new Date().toDateString();
  const isFull = status === "FULL" || count >= capacity;
  const spotsLeft = Math.max(0, capacity - count);
  const fill = Math.min(100, Math.round((count / capacity) * 100));

  async function toggle(action: "join" | "cancel") {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/events/${eventId}/rsvp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        setBusy(false);
        return;
      }
      setCount(data.confirmedCount);
      setRsvp(data.rsvp ? "CONFIRMED" : "CANCELLED");
      router.refresh();
    } catch {
      setError("Network error. Try again.");
    }
    setBusy(false);
  }

  return (
    <div className="rounded-lg border border-ink/8 bg-paper-raised p-7 shadow-card">
      <div className="flex items-center justify-between">
        <p className="eyebrow text-saffron-deep">Your RSVP</p>
        <span
          className={`flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider ${
            isPast ? "text-stone" : isFull ? "text-error" : "text-verify"
          }`}
        >
          <span className="size-1.5 rounded-full bg-current" aria-hidden />
          {isPast ? "Past" : isFull ? "Full" : "Open"}
        </span>
      </div>

      {/* capacity */}
      <div className="mt-5">
        <div className="flex items-baseline justify-between text-sm">
          <p className="text-stone">
            <span className="font-bold text-ink">{count}</span> travelling
          </p>
          <p className="text-stone">
            {spotsLeft > 0 ? `${spotsLeft} spots left` : "Waitlist closed"} · {capacity} max
          </p>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-ink/8" aria-hidden>
          <div
            className="h-full rounded-full bg-saffron transition-all duration-700 ease-expo"
            style={{ width: `${fill}%` }}
          />
        </div>
      </div>

      <div className="mt-7">
        {!signedIn ? (
          <div className="flex flex-col gap-3">
            <Link href="/login" className="w-full">
              <Button className="w-full" size="lg">
                <LogIn className="size-4" aria-hidden />
                Sign in to RSVP
              </Button>
            </Link>
            <p className="text-center text-xs text-stone">
              RSVPs are tied to your verified Yatra identity.
            </p>
          </div>
        ) : rsvp === "CONFIRMED" || rsvp === "ATTENDED" ? (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3 rounded-md border border-verify/25 bg-verify/8 px-4 py-3">
              <CalendarCheck2 className="size-5 shrink-0 text-verify" aria-hidden />
              <p className="text-sm font-medium text-verify">
                {rsvp === "ATTENDED"
                  ? "You attended — verified on record."
                  : "You're on the list. The place is waiting."}
              </p>
            </div>
            {isToday && (
              <Link href={`/events/${eventSlug}/check-in`}>
                <Button className="w-full" size="lg">
                  <ShieldCheck className="size-4" aria-hidden />
                  Check in now · verify attendance
                </Button>
              </Link>
            )}
            {rsvp === "CONFIRMED" && !isPast && (
              <Button
                variant="outline-dark"
                className="w-full"
                size="sm"
                disabled={busy}
                onClick={() => toggle("cancel")}
              >
                {busy ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <X className="size-4" aria-hidden />}
                Cancel RSVP
              </Button>
            )}
          </div>
        ) : isFull || isPast ? (
          <div className="rounded-md border border-error/25 bg-error/8 px-4 py-3 text-sm text-error">
            {isPast
              ? "This event has passed. Watch for the next one."
              : "This event is full. Spots open if someone cancels."}
          </div>
        ) : (
          <Button className="w-full" size="lg" disabled={busy} onClick={() => toggle("join")}>
            {busy ? (
              <Loader2 className="size-4 animate-spin" aria-hidden />
            ) : (
              <CalendarCheck2 className="size-4" aria-hidden />
            )}
            RSVP — I&rsquo;ll be there
            {!busy && <ArrowRight className="size-4" aria-hidden />}
          </Button>
        )}

        {error && (
          <p role="alert" className="mt-3 text-center text-sm text-error">
            {error}
          </p>
        )}
      </div>

      <p className="mt-5 border-t border-ink/8 pt-4 text-center text-xs leading-relaxed text-stone">
        {formatDate(eventDate)} · Show up, scan the QR on site,
        <br />
        and your contribution gets verified + stamped.
      </p>
    </div>
  );
}