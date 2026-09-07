"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === "register") {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? "Something went wrong. Try again.");
          setLoading(false);
          return;
        }
      }

      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Email or password is incorrect.");
        setLoading(false);
        return;
      }

      router.push("/profile");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  }

  const input =
    "w-full rounded-md border border-ink/15 bg-paper-raised px-4 py-3 text-[15px] text-ink placeholder:text-stone/50 transition-colors duration-300 focus:border-saffron-deep focus:outline-none focus:ring-2 focus:ring-saffron/30";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      {error && (
        <p
          role="alert"
          className="rounded-md border border-error/30 bg-error/8 px-4 py-3 text-sm text-error"
        >
          {error}
        </p>
      )}

      {mode === "register" && (
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-stone">
            Name
          </span>
          <input
            type="text"
            autoComplete="name"
            required
            minLength={2}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="How should the passport read it?"
            className={input}
          />
        </label>
      )}

      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-stone">Email</span>
        <input
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className={input}
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-stone">
          Password
        </span>
        <input
          type="password"
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={mode === "register" ? "At least 8 characters" : "Your password"}
          className={input}
        />
      </label>

      <Button type="submit" size="lg" className="mt-2 w-full" disabled={loading}>
        {loading ? (
          <Loader2 className="size-4 animate-spin" aria-hidden />
        ) : mode === "login" ? (
          "Sign in"
        ) : (
          "Create my Yatra identity"
        )}
        {!loading && <ArrowRight className="size-4" aria-hidden />}
      </Button>

      <p className="text-center text-sm text-stone">
        {mode === "login" ? (
          <>
            New to Yatra Setu?{" "}
            <a href="/register" className="font-semibold text-saffron-deep hover:underline">
              Create an account
            </a>
          </>
        ) : (
          <>
            Already travelling with us?{" "}
            <a href="/login" className="font-semibold text-saffron-deep hover:underline">
              Sign in
            </a>
          </>
        )}
      </p>
    </form>
  );
}