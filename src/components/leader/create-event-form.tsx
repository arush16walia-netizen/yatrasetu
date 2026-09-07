"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type DestinationOption = { slug: string; name: string };

const inputCls =
  "w-full rounded-md border border-ink/12 bg-paper px-3.5 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-stone/60 focus:border-saffron-deep focus:ring-2 focus:ring-saffron/20";

const labelCls = "block text-xs font-semibold uppercase tracking-[0.12em] text-stone";

export function CreateEventForm({ destinations }: { destinations: DestinationOption[] }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSubmitting(true);
    const form = new FormData(e.currentTarget);
    const payload = {
      title: form.get("title"),
      destinationSlug: form.get("destinationSlug"),
      description: form.get("description"),
      date: form.get("date"),
      startTime: form.get("startTime"),
      endTime: form.get("endTime") || undefined,
      meetingPoint: form.get("meetingPoint"),
      capacity: Number(form.get("capacity")),
      whatToBring: form.get("whatToBring") || undefined,
    };
    try {
      const res = await fetch("/api/events/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const j = await res.json();
      if (!res.ok) {
        setError(j.error ?? "Couldn't create the event.");
        return;
      }
      setSuccess(`“${j.event.title}” is live — its QR check-in code is ready on the event page.`);
      (e.target as HTMLFormElement).reset();
      router.refresh();
    } catch {
      setError("Network error — try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      {error && (
        <p role="alert" className="rounded-md border border-error/30 bg-error/10 p-3.5 text-sm text-error">
          {error}
        </p>
      )}
      {success && (
        <p role="status" className="rounded-md border border-verify/30 bg-verify/10 p-3.5 text-sm text-verify">
          {success}
        </p>
      )}

      <div>
        <label htmlFor="ev-title" className={labelCls}>
          Event name
        </label>
        <input id="ev-title" name="title" required minLength={4} className={cn(inputCls, "mt-1.5")} placeholder="Ganga Ghat Restoration Morning" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="ev-dest" className={labelCls}>
            Destination
          </label>
          <select id="ev-dest" name="destinationSlug" required className={cn(inputCls, "mt-1.5")}>
            {destinations.map((d) => (
              <option key={d.slug} value={d.slug}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="ev-cap" className={labelCls}>
            Capacity (5–500)
          </label>
          <input id="ev-cap" name="capacity" type="number" min={5} max={500} required defaultValue={40} className={cn(inputCls, "mt-1.5")} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="ev-date" className={labelCls}>
            Date
          </label>
          <input id="ev-date" name="date" type="date" required className={cn(inputCls, "mt-1.5")} />
        </div>
        <div>
          <label htmlFor="ev-start" className={labelCls}>
            Start time
          </label>
          <input id="ev-start" name="startTime" type="time" required defaultValue="06:30" className={cn(inputCls, "mt-1.5")} />
        </div>
        <div>
          <label htmlFor="ev-end" className={labelCls}>
            End time
          </label>
          <input id="ev-end" name="endTime" type="time" className={cn(inputCls, "mt-1.5")} />
        </div>
      </div>

      <div>
        <label htmlFor="ev-meet" className={labelCls}>
          Meeting point
        </label>
        <input id="ev-meet" name="meetingPoint" required minLength={4} className={cn(inputCls, "mt-1.5")} placeholder="Triveni Ghat, by the rafting point" />
      </div>

      <div>
        <label htmlFor="ev-desc" className={labelCls}>
          What the crew will do
        </label>
        <textarea id="ev-desc" name="description" required minLength={20} rows={4} className={cn(inputCls, "mt-1.5 resize-y")} placeholder="Describe the work, the terrain and what the morning looks like…" />
      </div>

      <div>
        <label htmlFor="ev-bring" className={labelCls}>
          What to bring <span className="font-normal normal-case tracking-normal">(optional)</span>
        </label>
        <input id="ev-bring" name="whatToBring" className={cn(inputCls, "mt-1.5")} placeholder="Old clothes, water bottle; gloves and bags provided" />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="inline-flex items-center justify-center gap-2 rounded-md bg-ink px-6 py-3 text-sm font-semibold text-paper transition-colors hover:bg-ink/85 disabled:opacity-60"
      >
        {submitting && <Loader2 className="size-4 animate-spin" aria-hidden />}
        {submitting ? "Publishing…" : "Publish the event"}
      </button>
    </form>
  );
}
