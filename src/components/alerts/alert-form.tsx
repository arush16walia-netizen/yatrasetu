"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, MapPin, Send, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  { id: "OVERCROWDING", label: "Overcrowding", hint: "More feet than the shore can hold" },
  { id: "WASTE", label: "Waste overflow", hint: "Bins, plastic, litter" },
  { id: "DAMAGE", label: "Damage", hint: "Broken paths, railings, structures" },
] as const;

const input =
  "w-full rounded-md border border-ink/15 bg-paper-raised px-4 py-3 text-[15px] text-ink placeholder:text-stone/50 transition-all duration-300 focus:border-saffron-deep focus:outline-none focus:ring-2 focus:ring-saffron/30";

export function AlertForm({ signedIn }: { signedIn: boolean }) {
  const router = useRouter();
  const [spotName, setSpotName] = useState("");
  const [region, setRegion] = useState("");
  const [category, setCategory] = useState<string>("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  if (!signedIn) {
    return (
      <div className="rounded-lg border border-saffron/30 bg-saffron/10 p-6">
        <p className="font-display text-lg text-ink">One thing before you report</p>
        <p className="mt-2 text-sm leading-relaxed text-stone">
          Alerts are signed, not anonymous — that&rsquo;s what keeps this board honest. Sign in and
          the form opens.
        </p>
        <div className="mt-4 flex gap-3">
          <Button size="sm" onClick={() => router.push("/login?next=/trending")}>
            Sign in
          </Button>
          <Button size="sm" variant="outline-dark" onClick={() => router.push("/register?next=/trending")}>
            Create an account
          </Button>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div className="rounded-lg border border-verify/30 bg-verify/10 p-6 text-center">
        <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-verify/20">
          <TriangleAlert className="size-5 text-verify" aria-hidden />
        </span>
        <p className="mt-4 font-display text-xl text-ink">Alert filed.</p>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-stone">
          It&rsquo;s on the board now, timestamped and signed. Organisers and community leads in
          that region will see it — and the next seva event may well be planned because of you.
        </p>
        <Button
          variant="outline-dark"
          size="sm"
          className="mt-5"
          onClick={() => {
            setSpotName("");
            setRegion("");
            setCategory("");
            setDescription("");
            setDone(false);
          }}
        >
          File another
        </Button>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ spotName, region, category, description }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Couldn't file the alert. Try again.");
        setLoading(false);
        return;
      }
      setLoading(false);
      setDone(true);
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
      {error && (
        <p role="alert" className="rounded-md border border-error/30 bg-error/10 px-4 py-3 text-sm text-error">
          {error}
        </p>
      )}

      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-stone">
          Spot name *
        </span>
        <div className="relative">
          <MapPin className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-stone" aria-hidden />
          <input
            type="text"
            required
            value={spotName}
            onChange={(e) => setSpotName(e.target.value)}
            placeholder="e.g. Baga Beach, Greater Hornbill gate…"
            className={cn(input, "pl-10")}
          />
        </div>
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-stone">
          Region
        </span>
        <input
          type="text"
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          placeholder="State, district, or nearest town"
          className={input}
        />
      </label>

      <fieldset className="flex flex-col gap-2">
        <legend className="text-xs font-semibold uppercase tracking-[0.14em] text-stone">
          What is happening? *
        </legend>
        <div className="grid gap-2 sm:grid-cols-3">
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setCategory(c.id)}
              aria-pressed={category === c.id}
              className={cn(
                "rounded-md border px-4 py-3 text-left transition-all duration-300",
                category === c.id
                  ? "border-saffron-deep bg-saffron/12 shadow-[inset_0_0_0_1px_rgb(230_81_0/0.4)]"
                  : "border-ink/12 bg-paper-raised hover:border-ink/30",
              )}
            >
              <span className={cn("block text-sm font-semibold", category === c.id ? "text-saffron-deep" : "text-ink")}>
                {c.label}
              </span>
              <span className="mt-0.5 block text-xs text-stone">{c.hint}</span>
            </button>
          ))}
        </div>
      </fieldset>

      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-stone">
          Describe it
        </span>
        <textarea
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What you saw, when, and how bad it is. Concrete details help organisers act."
          className={cn(input, "resize-none")}
        />
      </label>

      <Button type="submit" size="lg" disabled={loading || !spotName.trim() || !category}>
        {loading ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Send className="size-4" aria-hidden />}
        File the alert
      </Button>
    </form>
  );
}
