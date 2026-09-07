"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, CheckCircle2, Clock3, Loader2, ShieldX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const AFFILIATIONS = [
  { id: "NGO", label: "NGO / Non-profit", hint: "Registered society, trust or Section 8" },
  { id: "MUNICIPAL", label: "Municipal body", hint: "Ward office, panchayat, development authority" },
  { id: "COLLEGE", label: "College NSS / NCC cell", hint: "Student-led service units" },
  { id: "TOURISM", label: "Tourism dept. nodal officer", hint: "State or district tourism" },
] as const;

type Application = {
  affiliation: string;
  orgName: string;
  status: string;
  createdAt: string;
};

const input =
  "w-full rounded-md border border-ink/15 bg-paper-raised px-4 py-3 text-[15px] text-ink placeholder:text-stone/50 transition-all duration-300 focus:border-saffron-deep focus:outline-none focus:ring-2 focus:ring-saffron/30";

export function ApplyForm() {
  const router = useRouter();
  const [application, setApplication] = useState<Application | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [affiliation, setAffiliation] = useState("");
  const [orgName, setOrgName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/community-apply")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.application) {
          setApplication(d.application);
          setAffiliation(d.application.affiliation);
          setOrgName(d.application.orgName);
        }
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/community-apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ affiliation, orgName, contactEmail }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Couldn't submit the application. Try again.");
        setLoading(false);
        return;
      }
      setApplication(data.application);
      setLoading(false);
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  }

  if (!loaded) return <div className="h-40 animate-pulse rounded-lg bg-ink/5" aria-hidden />;

  // Not signed in
  if (application === null && !orgName) {
    return null; // parent page handles the signed-out state
  }

  // Already applied and pending/approved — show status instead of the form
  if (application && application.status !== "REJECTED") {
    const approved = application.status === "APPROVED";
    return (
      <div
        className={cn(
          "rounded-lg border p-6 sm:p-8",
          approved ? "border-verify/30 bg-verify/10" : "border-saffron/30 bg-saffron/10",
        )}
      >
        <span className="flex size-12 items-center justify-center rounded-full bg-paper-raised shadow-card">
          {approved ? (
            <CheckCircle2 className="size-6 text-verify" aria-hidden />
          ) : (
            <Clock3 className="size-6 text-saffron-deep" aria-hidden />
          )}
        </span>
        <p className="mt-4 font-display text-2xl tracking-tight text-ink">
          {approved ? "You are a verified Community Lead." : "Application under review."}
        </p>
        <p className="mt-2 max-w-lg text-sm leading-relaxed text-stone">
          {approved
            ? "Your events will carry the verified badge, and your organiser board unlocks QR check-in for every volunteer."
            : "Review typically takes 48 hours. Until approved, you can still volunteer at existing events — only event creation waits."}
        </p>
        <dl className="mt-5 grid gap-2 text-sm sm:grid-cols-2">
          <div className="rounded-md bg-paper-raised px-4 py-3">
            <dt className="text-xs uppercase tracking-[0.14em] text-stone">Organisation</dt>
            <dd className="mt-0.5 font-semibold text-ink">{application.orgName}</dd>
          </div>
          <div className="rounded-md bg-paper-raised px-4 py-3">
            <dt className="text-xs uppercase tracking-[0.14em] text-stone">Affiliation</dt>
            <dd className="mt-0.5 font-semibold text-ink">
              {AFFILIATIONS.find((a) => a.id === application.affiliation)?.label ?? application.affiliation}
            </dd>
          </div>
        </dl>
      </div>
    );
  }

  const rejected = application?.status === "REJECTED";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
      {error && (
        <p role="alert" className="rounded-md border border-error/30 bg-error/10 px-4 py-3 text-sm text-error">
          {error}
        </p>
      )}

      {rejected && (
        <p className="flex items-start gap-2 rounded-md border border-error/30 bg-error/10 px-4 py-3 text-sm text-error">
          <ShieldX className="mt-0.5 size-4 shrink-0" aria-hidden />
          Your previous application wasn&rsquo;t approved. You can update the details below and
          submit again.
        </p>
      )}

      <fieldset className="flex flex-col gap-2">
        <legend className="text-xs font-semibold uppercase tracking-[0.14em] text-stone">
          Affiliation type *
        </legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {AFFILIATIONS.map((a) => (
            <button
              key={a.id}
              type="button"
              onClick={() => setAffiliation(a.id)}
              aria-pressed={affiliation === a.id}
              className={cn(
                "rounded-md border px-4 py-3.5 text-left transition-all duration-300",
                affiliation === a.id
                  ? "border-saffron-deep bg-saffron/12 shadow-[inset_0_0_0_1px_rgb(226_162_63/0.4)]"
                  : "border-ink/12 bg-paper-raised hover:border-ink/30",
              )}
            >
              <span className={cn("block text-sm font-semibold", affiliation === a.id ? "text-saffron-deep" : "text-ink")}>
                {a.label}
              </span>
              <span className="mt-0.5 block text-xs text-stone">{a.hint}</span>
            </button>
          ))}
        </div>
      </fieldset>

      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-stone">
          Organisation / body name *
        </span>
        <input
          type="text"
          required
          value={orgName}
          onChange={(e) => setOrgName(e.target.value)}
          placeholder="e.g. Friends of the Ganga, Rishikesh"
          className={input}
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-stone">
          Contact email for review
        </span>
        <input
          type="email"
          value={contactEmail}
          onChange={(e) => setContactEmail(e.target.value)}
          placeholder="Optional — where review updates should land"
          className={input}
        />
      </label>

      <p className="text-xs leading-relaxed text-stone">
        Lead status is verified against your affiliation — never self-granted. Organisers verify
        documents before events carry the checked badge.
      </p>

      <Button type="submit" size="lg" disabled={loading || !affiliation || orgName.trim().length < 3}>
        {loading ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
        {rejected ? "Re-submit application" : "Submit application"}
        {!loading && <ArrowRight className="size-4" aria-hidden />}
      </Button>
    </form>
  );
}
