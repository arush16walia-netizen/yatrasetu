"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  BadgeCheck,
  Camera,
  Clock3,
  Loader2,
  MapPin,
  PartyPopper,
  ScanLine,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { Button } from "@/components/ui/button";

type Awarded = {
  code: string;
  name: string;
  nameHindi: string | null;
  icon: string;
  color: string | null;
  tier: number;
};

type Success = {
  attendance: { verifiedAt: string; latitude: number | null; longitude: number | null; geoAccuracy: number | null };
  eventTitle: string;
  destinationName: string;
  pointsAwarded?: number;
  stamps: Awarded[];
};


export function CheckinFlow({
  eventId,
  eventSlug,
  eventTitle,
  destinationName,
  rsvpState,
}: {
  eventId: string;
  eventSlug: string;
  eventTitle: string;
  destinationName: string;
  rsvpState: "CONFIRMED" | "ATTENDED" | null;
}) {
  const searchParams = useSearchParams();
  const reduce = useReducedMotion();
  const [code, setCode] = useState((searchParams.get("code") ?? "").toUpperCase());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<Success | null>(null);
  const [cameraOn, setCameraOn] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanningRef = useRef(false);

  const canScan = typeof window !== "undefined" && "BarcodeDetector" in window;
  const inputRef = useRef<HTMLInputElement>(null);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCameraOn(false);
  }, []);

  useEffect(() => () => stopCamera(), [stopCamera]);

  async function submit(codeToUse?: string) {
    const value = (codeToUse ?? code).trim().toUpperCase();
    if (!value) {
      setError("Enter the check-in code from the event board.");
      return;
    }
    setBusy(true);
    setError(null);
    stopCamera();

    // Ask for location — proof, not permission theatre. Denial is tolerated.
    let geo: { latitude: number | null; longitude: number | null; accuracy: number | null } = {
      latitude: null,
      longitude: null,
      accuracy: null,
    };
    if (typeof navigator !== "undefined" && "geolocation" in navigator) {
      try {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 8000, maximumAge: 30000 }),
        );
        geo = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        };
      } catch {
        // geo denied/unavailable — proceed; record is still timestamped
      }
    }

    try {
      const res = await fetch(`/api/events/${eventId}/checkin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: value, ...geo }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Couldn't verify check-in. Try again.");
        setBusy(false);
        return;
      }
      setSuccess(data);
    } catch {
      setError("Network error. Try again.");
    }
    setBusy(false);
  }

  async function startCamera() {
    setCameraError(null);
    if (!canScan) {
      setCameraError("Camera scanning isn't available in this browser. Enter the code manually.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraOn(true);
      scanLoop();
    } catch {
      setCameraError("Camera unavailable — enter the code shown at the site instead.");
    }
  }

  async function scanLoop() {
    if (scanningRef.current) return;
    scanningRef.current = true;
    try {
      const detector = new (window as unknown as {
        BarcodeDetector: new (o?: object) => { detect: (v: HTMLVideoElement) => Promise<Array<{ rawValue: string }>> };
      }).BarcodeDetector();
      while (streamRef.current && videoRef.current) {
        const codes = await detector.detect(videoRef.current);
        for (const detected of codes) {
          const match = /[?&]code=([A-Za-z0-9-]+)/.exec(detected.rawValue);
          if (match) {
            setCode(match[1].toUpperCase());
            stopCamera();
            await submit(match[1]);
            return;
          }
        }
        await new Promise((r) => setTimeout(r, 350));
      }
    } catch {
      if (streamRef.current) setCameraError("Couldn't read the code from the camera feed.");
      stopCamera();
    } finally {
      scanningRef.current = false;
    }
  }

  useEffect(() => {
    if (cameraOn && canScan) void scanLoop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cameraOn]);

  // ---------------- Success celebration ----------------
  if (success) {
    const verifiedAt = new Date(success.attendance.verifiedAt);
    return (
      <div className="mx-auto w-full max-w-lg">
        <motion.div
          initial={reduce ? false : { scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 220, damping: 18 }}
          className="rounded-lg bg-paper-raised p-8 text-center shadow-lift sm:p-10"
        >
          <div className="mx-auto grid size-20 place-items-center rounded-full bg-verify/12">
            <motion.span
              initial={reduce ? false : { scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 300, damping: 14 }}
            >
              <ShieldCheck className="size-10 text-verify" aria-hidden />
            </motion.span>
          </div>
          <p className="eyebrow mt-6 text-verify">Contribution verified</p>
          <h1 className="mt-3 font-display text-3xl tracking-tight text-ink sm:text-4xl">
            Thank you, truly.
          </h1>
          <p className="mx-auto mt-3 max-w-sm text-[15px] leading-relaxed text-stone">
            Your presence at <strong className="text-ink">{success.eventTitle}</strong> in{" "}
            {success.destinationName} is now on permanent record.
          </p>

          {/* Proof card */}
          <div className="mt-7 rounded-lg border border-verify/25 bg-verify/8 p-5 text-left">
            <p className="eyebrow flex items-center gap-2 text-verify">
              <BadgeCheck className="size-4" aria-hidden />
              Verification record
            </p>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between gap-4">
                <dt className="flex items-center gap-2 text-stone">
                  <Clock3 className="size-4 text-verify" aria-hidden /> Timestamp
                </dt>
                <dd className="font-medium text-ink">
                  {verifiedAt.toLocaleDateString("en-IN", { day: "numeric", month: "short" })},{" "}
                  {verifiedAt.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="flex items-center gap-2 text-stone">
                  <MapPin className="size-4 text-verify" aria-hidden /> Location
                </dt>
                <dd className="font-medium text-ink">
                  {success.attendance.latitude != null
                    ? `${success.attendance.latitude.toFixed(4)}°, ${success.attendance.longitude?.toFixed(4)}°`
                    : "Captured at check-in"}
                  {success.attendance.geoAccuracy != null && (
                    <span className="ml-1 text-xs text-stone">±{Math.round(success.attendance.geoAccuracy)}m</span>
                  )}
                </dd>
              </div>
            </dl>
          </div>

          {/* Points */}
          {success.pointsAwarded != null && (
            <div className="mt-6 rounded-lg border border-saffron/30 bg-saffron/8 px-5 py-4">
              <p className="flex items-center justify-center gap-2 font-mono text-2xl font-bold text-saffron-deep">
                <Sparkles className="size-5" aria-hidden />
                +{success.pointsAwarded} service points
              </p>
              <p className="mt-1 text-center text-xs text-stone">
                Points redeem against rewards on the next journey.
              </p>
            </div>
          )}

          {/* Stamps */}
          {success.stamps.length > 0 && (
            <div className="mt-7">
              <p className="eyebrow flex items-center justify-center gap-2 text-saffron-deep">
                <PartyPopper className="size-4" aria-hidden />
                Stamps earned
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-4">
                {success.stamps.map((s) => (
                  <div key={s.code} className="flex flex-col items-center">
                    <span
                      className="grid size-16 place-items-center rounded-full border-2 border-dashed"
                      style={{ borderColor: s.color ?? "#E65100", color: s.color ?? "#C44400" }}
                    >
                      <Sparkles className="size-6" aria-hidden />
                    </span>
                    <p className="mt-2 text-xs font-bold text-ink">{s.name}</p>
                    {s.nameHindi && <p className="font-deva text-[11px] text-stone">{s.nameHindi}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link href="/passport">
              <Button className="w-full sm:w-auto">
                Open your Yatra Passport
              </Button>
            </Link>
            <Link href="/rewards">
              <Button variant="outline-dark" className="w-full sm:w-auto">
                See what stamps unlock
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  // ---------------- Check-in form ----------------
  return (
    <div className="mx-auto w-full max-w-lg">
      <div className="rounded-lg bg-paper-raised p-8 shadow-card sm:p-10">
        <p className="eyebrow flex items-center gap-2 text-saffron-deep">
          <ScanLine className="size-4" aria-hidden />
          On-site verification
        </p>
        <h1 className="mt-4 font-display text-3xl tracking-tight text-ink sm:text-4xl">
          Check in at {eventTitle}
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-stone">
          Find the event board at the meeting point — it shows a QR and a code.
          Scan it, or type the code below.
        </p>

        {rsvpState === null && (
          <p className="mt-5 rounded-md border border-error/30 bg-error/8 px-4 py-3 text-sm text-error">
            You haven&rsquo;t RSVP&rsquo;d to this event yet.{" "}
            <Link href={`/events/${eventSlug}`} className="font-semibold underline underline-offset-2">
              RSVP first
            </Link>{" "}
            — check-in only works for registered participants.
          </p>
        )}

        <div className="mt-6">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-stone">
              Check-in code
            </span>
            <input
              ref={inputRef}
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="e.g. RIVER-4821"
              autoCapitalize="characters"
              autoCorrect="off"
              spellCheck={false}
              className="w-full rounded-md border border-ink/15 bg-paper px-4 py-3.5 text-center font-mono text-xl tracking-[0.2em] text-ink placeholder:text-stone/40 transition-all duration-300 focus:border-saffron-deep focus:outline-none focus:ring-2 focus:ring-saffron/30"
            />
          </label>

          {error && (
            <p role="alert" className="mt-3 rounded-md border border-error/30 bg-error/8 px-4 py-3 text-sm text-error">
              {error}
            </p>
          )}

          <Button
            className="mt-4 w-full"
            size="lg"
            disabled={busy || rsvpState === null}
            onClick={() => void submit()}
          >
            {busy ? (
              <Loader2 className="size-4 animate-spin" aria-hidden />
            ) : (
              <ShieldCheck className="size-4" aria-hidden />
            )}
            {busy ? "Verifying…" : "Verify my attendance"}
          </Button>

          {canScan && (
            <div className="mt-3">
              {!cameraOn ? (
                <Button variant="outline-dark" className="w-full" onClick={() => void startCamera()}>
                  <Camera className="size-4" aria-hidden />
                  Scan the QR with my camera
                </Button>
              ) : (
                <div className="mt-3 overflow-hidden rounded-md bg-ink">
                  <video ref={videoRef} className="mx-auto aspect-[4/3] w-full object-cover" muted playsInline />
                  <p className="py-2 text-center text-xs text-mist">Point at the event QR…</p>
                </div>
              )}
            </div>
          )}
          {cameraError && (
            <p className="mt-3 text-center text-xs text-stone">{cameraError}</p>
          )}
        </div>

        <p className="mt-6 border-t border-ink/8 pt-5 text-center text-xs leading-relaxed text-stone">
          Verification is timestamped and location-stamped the moment you check in.
          <br />
          It cannot be edited or removed — <span className="font-deva">यात्रा बने सेवा</span>
        </p>
      </div>
    </div>
  );
}