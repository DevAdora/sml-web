"use client";

import { useMemo, useState } from "react";
import { createClient } from "@/app/lib/supabase/browser";
import { useRouter, useSearchParams } from "next/navigation";

export default function AuthPage() {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  const searchParams = useSearchParams();

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const error = searchParams.get("error");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${location.origin}/auth/callback?next=/me`,
          },
        });
        if (error) throw error;

        setMessage(
          "Account created. Check your email if confirmations are enabled, then come back and sign in."
        );
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;

        router.push("/me");
        router.refresh();
      }
    } catch (err: any) {
      setMessage(err?.message ?? "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-black px-4">
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-zinc-950 shadow p-6 space-y-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            {mode === "signin" ? "Sign in" : "Create account"}
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            SML — Share Mo Lang
          </p>
        </div>

        {error && (
          <div className="rounded-xl bg-red-50 text-red-700 px-4 py-2 text-sm dark:bg-red-950/40 dark:text-red-200">
            {error}
          </div>
        )}

        {message && (
          <div className="rounded-xl bg-zinc-100 text-zinc-800 px-4 py-2 text-sm dark:bg-zinc-900 dark:text-zinc-200">
            {message}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-3">
          <div className="space-y-1">
            <label className="text-sm text-zinc-700 dark:text-zinc-300">
              Email
            </label>
            <input
              className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-400"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm text-zinc-700 dark:text-zinc-300">
              Password
            </label>
            <input
              className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-400"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete={
                mode === "signin" ? "current-password" : "new-password"
              }
              minLength={6}
            />
          </div>

          <button
            disabled={loading}
            className="w-full h-11 rounded-xl bg-zinc-900 text-white dark:bg-zinc-50 dark:text-black font-medium disabled:opacity-60"
            type="submit"
          >
            {loading
              ? "Please wait..."
              : mode === "signin"
              ? "Sign in"
              : "Sign up"}
          </button>
        </form>

        <div className="flex items-center justify-between text-sm">
          <button
            className="text-zinc-700 dark:text-zinc-300 hover:underline"
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            type="button"
          >
            {mode === "signin"
              ? "Need an account? Sign up"
              : "Already have an account? Sign in"}
          </button>

          <a
            className="text-zinc-700 dark:text-zinc-300 hover:underline"
            href="/"
          >
            Home
          </a>
        </div>
      </div>
    </div>
  );
}
