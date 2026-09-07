"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, Crosshair, Loader2, TicketCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { LITTER_CATEGORIES, LITTER_VOLUMES } from "@/lib/litter";

const inputCls =
  "w-full rounded-md border border-ink/12 bg-paper px-3.5 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-stone/60 focus:border-saffron-deep focus:ring-2 focus:ring-saffron/20";
const labelCls = "block text-xs font-semibold uppercase tracking-[0.12em] text-stone";


export function LitterReportForm() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [coords, setCoords] = useState<{ lat: number; lng: number; accuracy: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [hasPhoto, setHasPhoto] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ticket, setTicket] = useState<{ ticketCode: string; pointsAwarded: number } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function locate() {
    if (!("geolocation" in navigator)) {
      setError("This browser can't share GPS — type the landmark instead.");
      return;
    }
    setLocating(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({
          lat: Number(pos.coords.latitude.toFixed(5)),
          lng: Number(pos.coords.longitude.toFixed(5)),
          accuracy: Math.round(pos.coords.accuracy),
        });
        setLocating(false);
      },
      () => {
        setLocating(false);
        setError("GPS denied — that's fine, a clear landmark works too.");
      },
      { enableHighAccuracy: true, timeout: 10_000 },
    );
  }

  function onPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setHasPhoto(true);
    setPhotoPreview(URL.createObjectURL(file));
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const form = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/report-litter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          spotName: form.get("spotName"),
          region: form.get("region") || undefined,
          category: form.get("category"),
          volume: form.get("volume"),
          description: form.get("description") || undefined,
          latitude: coords?.lat ?? null,
          longitude: coords?.lng ?? null,
          hasPhoto,
        }),
      });
      const j = await res.json();
      if (!res.ok) {
        setError(j.error ?? "Couldn't file the report.");
        return;
      }
      setTicket(j);
      router.refresh();
    } catch {
      setError("Network error — try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (ticket) {
    return (
      <div className="rounded-lg border border-verify/30 bg-verify/8 p-6 text-center" role="status">
        <TicketCheck className="mx-auto size-8 text-verify" aria-hidden />
        <p className="mt-3 font-mono text-2xl font-bold tracking-wider text-ink">{ticket.ticketCode}</p>
        <p className="mt-2 text-sm leading-relaxed text-stone">
          Dispatched to local crews. <strong className="text-verify">+{ticket.pointsAwarded} service points</strong>{" "}
          are already in your ledger — reload the page to report another spot.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-5" noValidate>
      {error && (
        <p role="alert" className="rounded-md border border-error/30 bg-error/10 p-3.5 text-sm text-error">
          {error}
        </p>
      )}

      {/* GPS */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={locate}
          disabled={locating || Boolean(coords)}
          className="inline-flex items-center gap-2 rounded-md bg-ink px-4 py-2.5 text-sm font-semibold text-paper transition-colors hover:bg-ink/85 disabled:opacity-60"
        >
          {locating ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Crosshair className="size-4" aria-hidden />}
          {coords ? "GPS locked" : locating ? "Locating…" : "1-tap auto GPS"}
        </button>
        {coords && (
          <p className="text-xs text-stone">
            {coords.lat}, {coords.lng} · ±{coords.accuracy}m
          </p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="lit-spot" className={labelCls}>Spot name / landmark</label>
          <input id="lit-spot" name="spotName" required minLength={4} className={cn(inputCls, "mt-1.5")} placeholder="Trail to Nongriat, past the 2nd bridge" />
        </div>
        <div>
          <label htmlFor="lit-region" className={labelCls}>Region <span className="font-normal normal-case">(optional)</span></label>
          <input id="lit-region" name="region" className={cn(inputCls, "mt-1.5")} placeholder="Meghalaya" />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="lit-cat" className={labelCls}>Waste category</label>
          <select id="lit-cat" name="category" required className={cn(inputCls, "mt-1.5")}>
            {LITTER_CATEGORIES.map((c) => (
              <option key={c.key} value={c.key}>{c.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="lit-vol" className={labelCls}>Estimated volume</label>
          <select id="lit-vol" name="volume" required className={cn(inputCls, "mt-1.5")} defaultValue="MODERATE">
            {LITTER_VOLUMES.map((v) => (
              <option key={v.key} value={v.key}>{v.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Photo — client-side proof preview; upload storage is prototype-stage */}
      <div>
        <label htmlFor="lit-photo" className={labelCls}>Photo proof</label>
        <div className="mt-1.5 flex items-center gap-4">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="inline-flex items-center gap-2 rounded-md border border-ink/15 px-4 py-2.5 text-sm font-medium text-ink transition-colors hover:border-ink/40"
          >
            <Camera className="size-4" aria-hidden />
            {photoPreview ? "Change photo" : "Attach a photo"}
          </button>
          <input
            ref={fileRef}
            id="lit-photo"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onPhoto}
          />
          {photoPreview && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photoPreview} alt="Litter report photo preview" className="size-14 rounded-md object-cover" />
          )}
        </div>
        <p className="mt-1.5 text-[11px] text-stone">
          Proof is previewed on your device — photo upload storage is prototype-stage; the GPS fix is the verification.
        </p>
      </div>

      <div>
        <label htmlFor="lit-desc" className={labelCls}>Anything the crew should know? <span className="font-normal normal-case">(optional)</span></label>
        <textarea id="lit-desc" name="description" rows={3} className={cn(inputCls, "mt-1.5 resize-y")} placeholder="Bag needs two people to lift; 15 min walk from the roadhead." />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="inline-flex items-center justify-center gap-2 rounded-md bg-ink px-6 py-3 text-sm font-semibold text-paper transition-colors hover:bg-ink/85 disabled:opacity-60"
      >
        {submitting && <Loader2 className="size-4 animate-spin" aria-hidden />}
        {submitting ? "Dispatching…" : "Dispatch cleanup ticket · +50 points"}
      </button>
    </form>
  );
}
