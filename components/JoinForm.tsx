"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Mode = "signup" | "signin" | "forgot";

const joinErrorMessages: Record<string, string> = {
  auth: "Sign-in link failed. Request a new confirmation email or sign in with password.",
  access_denied: "That link expired or was already used. Sign in with your password instead.",
  otp_expired: "Email link expired. Sign in with your password, or sign up again for a new link."
};

export default function JoinForm({ initialError }: { initialError?: string | null }) {
  const [mode, setMode] = useState<Mode>("signup");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(() => {
    if (!initialError) return null;
    return joinErrorMessages[initialError] ?? joinErrorMessages.auth;
  });
  const [message, setMessage] = useState<string | null>(null);

  const supabase = useMemo(() => createClient(), []);

  async function ensureMember(name?: string) {
    const response = await fetch("/api/members/ensure", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fullName: name })
    });

    const payload = (await response.json()) as { ok: boolean; error?: string };
    if (!response.ok || !payload.ok) {
      throw new Error(payload.error || "Could not create member profile");
    }
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setMessage(null);

    try {
      const trimmedEmail = email.trim().toLowerCase();
      const trimmedName = fullName.trim();

      if (mode === "forgot") {
        if (!trimmedEmail) {
          throw new Error("Enter the email for your account.");
        }

        const { error: resetError } = await supabase.auth.resetPasswordForEmail(trimmedEmail, {
          redirectTo: `${window.location.origin}/auth/callback?next=/join/reset`
        });

        if (resetError) {
          throw resetError;
        }

        setMessage(
          "If an account exists for that email, we sent a reset link. Check your inbox (and spam)."
        );
        return;
      }

      if (!trimmedEmail || password.length < 6) {
        throw new Error("Use a valid email and a password of at least 6 characters.");
      }

      if (mode === "signup") {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: trimmedEmail,
          password,
          options: {
            data: { full_name: trimmedName || undefined },
            emailRedirectTo: `${window.location.origin}/auth/callback?next=/account`
          }
        });

        if (signUpError) throw signUpError;

        if (data.session) {
          await ensureMember(trimmedName);
          window.location.assign("/account");
          return;
        }

        setMessage(
          "Check your email to confirm your account, then come back to sign in."
        );
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: trimmedEmail,
          password
        });

        if (signInError) throw signInError;

        await ensureMember(trimmedName);
        window.location.assign("/account");
        return;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="w-full max-w-md">
      {mode === "forgot" ? (
        <div className="mb-8 border-b border-white/10 pb-3">
          <p className="text-sm text-white">Reset password</p>
          <button
            type="button"
            onClick={() => {
              setMode("signin");
              setError(null);
              setMessage(null);
            }}
            className="mt-2 text-sm text-panteron-violet transition hover:text-white"
          >
            ← Back to sign in
          </button>
        </div>
      ) : (
        <div className="mb-8 flex gap-6 border-b border-white/10">
          <button
            type="button"
            onClick={() => {
              setMode("signup");
              setError(null);
              setMessage(null);
            }}
            className={`pb-3 text-sm tracking-wide transition ${
              mode === "signup"
                ? "border-b-2 border-panteron-violet text-white"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            Sign up
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("signin");
              setError(null);
              setMessage(null);
            }}
            className={`pb-3 text-sm tracking-wide transition ${
              mode === "signin"
                ? "border-b-2 border-panteron-violet text-white"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            Sign in
          </button>
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-5">
        {mode === "signup" ? (
          <label className="block">
            <span className="mb-2 block text-xs uppercase tracking-[0.25em] text-zinc-500">
              Name
            </span>
            <input
              type="text"
              autoComplete="name"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              className="w-full border border-white/15 bg-transparent px-4 py-3 text-white outline-none transition placeholder:text-zinc-600 focus:border-panteron-violet"
              placeholder="Your name"
            />
          </label>
        ) : null}

        <label className="block">
          <span className="mb-2 block text-xs uppercase tracking-[0.25em] text-zinc-500">
            Email
          </span>
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full border border-white/15 bg-transparent px-4 py-3 text-white outline-none transition placeholder:text-zinc-600 focus:border-panteron-violet"
            placeholder="you@email.com"
          />
        </label>

        {mode !== "forgot" ? (
          <label className="block">
            <span className="mb-2 block text-xs uppercase tracking-[0.25em] text-zinc-500">
              Password
            </span>
            <input
              type="password"
              required
              minLength={6}
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full border border-white/15 bg-transparent px-4 py-3 text-white outline-none transition placeholder:text-zinc-600 focus:border-panteron-violet"
              placeholder="At least 6 characters"
            />
          </label>
        ) : null}

        {mode === "signin" ? (
          <button
            type="button"
            onClick={() => {
              setMode("forgot");
              setError(null);
              setMessage(null);
            }}
            className="text-sm text-zinc-400 transition hover:text-panteron-violet"
          >
            Forgot password?
          </button>
        ) : null}

        {error ? <p className="text-sm text-red-400">{error}</p> : null}
        {message ? (
          <p className="text-sm text-panteron-violet">
            {message}{" "}
            {message.includes("Welcome") || message.includes("Signed in") ? (
              <Link href="/raffles" className="underline hover:text-white">
                Browse raffles
              </Link>
            ) : null}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={busy}
          className="w-full bg-panteron-purple px-6 py-3 text-sm font-medium text-white transition hover:bg-panteron-violet disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy
            ? "Working…"
            : mode === "signup"
              ? "Join the universe"
              : mode === "forgot"
                ? "Send reset link"
                : "Sign in"}
        </button>
      </form>
    </div>
  );
}
