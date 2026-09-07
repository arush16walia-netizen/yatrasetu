"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Real redemption: calls the transactional API, shows the issued coupon code,
 * and refreshes the server components so balances update everywhere.
 */
export function RedeemButton({
  rewardId,
  rewardTitle,
  affordable,
  stampsOwned,
  costStamps,
}: {
  rewardId: string;
  rewardTitle: string;
  affordable: boolean;
  stampsOwned: number;
  costStamps: number;
}) {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "busy" | "done">("idle");
  const [code, setCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function redeem() {
    setState("busy");
    setError(null);
    try {
      const res = await fetch("/api/rewards/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rewardId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Redemption failed. Try again.");
        setState("idle");
        return;
      }
      setCode(data.redemptionCode);
      setState("done");
      router.refresh();
    } catch {
      setError("Network error. Try again.");
      setState("idle");
    }
  }

  if (state === "done" && code) {
    return (
      <div className="rounded-md border border-verify/30 bg-verify/10 p-4 text-center">
        <p className="flex items-center justify-center gap-2 text-sm font-semibold text-verify">
          <Check className="size-4" aria-hidden />
          {rewardTitle} redeemed
        </p>
        <code className="mt-2 block font-mono text-base font-bold tracking-wider text-ink">{code}</code>
        <p className="mt-1 text-[11px] text-stone">Saved to your codes list below.</p>
      </div>
    );
  }

  return (
    <>
      <Button
        className="w-full"
        size="sm"
        disabled={!affordable || state === "busy"}
        onClick={() => void redeem()}
      >
        {state === "busy" ? (
          <Loader2 className="size-4 animate-spin" aria-hidden />
        ) : (
          <Ticket className="size-4" aria-hidden />
        )}
        {affordable
          ? `Redeem for ${costStamps} stamp${costStamps === 1 ? "" : "s"}`
          : `${costStamps - stampsOwned} more stamp${costStamps - stampsOwned === 1 ? "" : "s"} needed`}
      </Button>
      {error && (
        <p role="alert" className="mt-2 text-center text-xs text-error">
          {error}
        </p>
      )}
    </>
  );
}
