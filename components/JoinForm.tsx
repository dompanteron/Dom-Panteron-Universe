"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Mode = "signup" | "signin";

export default function JoinForm() {
  const [mode, setMode] = useState<Mode>("signup");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
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

      if (!trimmedEmail || password.length < 6) {
        throw new Error("Use a valid email and a password of at least 6 characters.");
      }

      if (mode === "signup") {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: trimmedEmail,
          password,
          options: {
            data: { full_name: trimmedName || undefined },
            emailRedirectTo: `${window.location.origin}/auth/callback?next=/join`
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
              : "Sign in"}
        </button>
      </form>
    </div>
  );
}
