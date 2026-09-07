"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export function ApplicationReview({
  applicationId,
  applicantName,
}: {
  applicationId: string;
  applicantName: string;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  async function decide(decision: "APPROVED" | "REJECTED") {
    setError(null);
    const res = await fetch("/api/admin/applications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ applicationId, decision }),
    });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(j.error ?? "Couldn't record the decision.");
      return;
    }
    startTransition(() => router.refresh());
  }

  return (
    <div>
      {error && (
        <p role="alert" className="mb-3 text-sm text-error">
          {error}
        </p>
      )}
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => startTransition(() => decide("APPROVED"))}
          disabled={pending}
          className="rounded-md bg-verify px-5 py-2.5 text-sm font-semibold text-paper transition-colors hover:bg-verify/85 disabled:opacity-60"
        >
          Approve {applicantName.split(" ")[0]} as lead
        </button>
        <button
          type="button"
          onClick={() => startTransition(() => decide("REJECTED"))}
          disabled={pending}
          className="rounded-md border border-ink/15 px-5 py-2.5 text-sm font-semibold text-stone transition-colors hover:border-error/40 hover:text-error disabled:opacity-60"
        >
          Decline
        </button>
      </div>
    </div>
  );
}
