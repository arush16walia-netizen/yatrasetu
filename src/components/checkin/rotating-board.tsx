"use client";

import { useCallback, useEffect, useState } from "react";
import { toDataURL } from "qrcode";
import { RefreshCw } from "lucide-react";

type Props = {
  eventId: string;
  eventSlug: string;
  eventTitle: string;
  staticCode: string;
  origin: string;
};

/**
 * The zero-proxy event board: a QR whose token rotates every 15 seconds.
 * A screenshot forwarded over WhatsApp expires with its window — the crew
 * must be standing at the site when they scan.
 */
export function RotatingBoard({ eventId, eventSlug, eventTitle, staticCode, origin }: Props) {
  const [qr, setQr] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [remaining, setRemaining] = useState(15);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch(`/api/events/${eventId}/qr-token`, { cache: "no-store" });
      if (!res.ok) throw new Error("token unavailable");
      const j = await res.json();
      setToken(j.token);
      setRemaining(j.expiresIn ?? 15);
      const url = `${origin}/events/${eventSlug}/check-in?code=${encodeURIComponent(
        `${staticCode}.${j.token}`,
      )}`;
      setQr(await toDataURL(url, { margin: 1, width: 560, color: { dark: "#0B0F17", light: "#FFFFFF" } }));
      setError(null);
    } catch {
      setError("Token service unreachable — the printed code below still works.");
    }
  }, [eventId, eventSlug, staticCode, origin]);

  useEffect(() => {
    refresh();
    const poll = setInterval(refresh, 15_000);
    const tick = setInterval(() => setRemaining((r) => (r > 0 ? r - 1 : 0)), 1_000);
    return () => {
      clearInterval(poll);
      clearInterval(tick);
    };
  }, [refresh]);

  const pct = Math.max(0, Math.min(100, (remaining / 15) * 100));
  const urgent = remaining <= 5;

  return (
    <div>
      <div className="mx-auto w-fit rounded-lg bg-paper p-6 shadow-lift">
        {qr ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={qr}
            alt={`Rotating QR for checking in to ${eventTitle} — refreshes every 15 seconds`}
            width={320}
            height={320}
            className="size-64 rounded-md"
          />
        ) : (
          <div className="grid size-64 animate-pulse place-items-center rounded-md bg-ink/5 text-xs text-stone">
            {error ? "offline" : "loading…"}
          </div>
        )}
      </div>

      {/* Countdown ring */}
      <div className="mx-auto mt-5 w-64" role="timer" aria-live="off">
        <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.16em] text-stone">
          <span className="flex items-center gap-1.5">
            <RefreshCw className="size-3" aria-hidden />
            rotates in
          </span>
          <span className={urgent ? "text-error" : "text-ink"}>{remaining}s</span>
        </div>
        <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-ink/8" aria-hidden>
          <div
            className={`h-full rounded-full transition-[width] duration-1000 ease-linear ${
              urgent ? "bg-error" : "bg-verify"
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <p className="mt-6 text-xs uppercase tracking-[0.2em] text-stone">Or the code is</p>
      <p className="mt-2 font-mono text-4xl font-bold tracking-[0.25em] text-ink">
        {token ? `${staticCode}.${token}` : staticCode}
      </p>
      {error && <p className="mt-3 text-xs text-error">{error}</p>}
      <p className="mt-3 font-deva text-sm text-stone">
        Screenshot भेजने से कुछ नहीं होगा — code हर 15 second बदलता है। Be here, scan, verify.
      </p>
    </div>
  );
}
