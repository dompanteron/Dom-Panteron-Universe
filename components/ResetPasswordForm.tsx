"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordForm() {
  const supabase = useMemo(() => createClient(), []);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function checkSession() {
      const { data } = await supabase.auth.getSession();
      if (!cancelled) {
        setReady(Boolean(data.session));
      }
    }

    void checkSession();

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!cancelled) {
        setReady(Boolean(session));
      }
    });

    return () => {
      cancelled = true;
      subscription.subscription.unsubscribe();
    };
  }, [supabase]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setMessage(null);

    if (password.length < 6) {
      setError("Use at least 6 characters.");
      setBusy(false);
      return;
    }

    if (password !== confirm) {
      setError("Passwords do not match.");
      setBusy(false);
      return;
    }

    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) {
        throw updateError;
      }

      setMessage("Password updated. Redirecting to your account…");
      window.setTimeout(() => {
        window.location.assign("/account");
      }, 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update password.");
    } finally {
      setBusy(false);
    }
  }

  if (!ready) {
    return (
      <div className="w-full max-w-md space-y-4">
        <p className="text-sm text-zinc-400">
          This reset link is invalid or expired. Request a new one from the join page.
        </p>
        <Link
          href="/join"
          className="inline-block text-sm text-panteron-violet transition hover:text-white"
        >
          Back to join →
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="w-full max-w-md space-y-5">
      <p className="text-sm text-zinc-400">Choose a new password for your account.</p>

      <label className="block">
        <span className="mb-2 block text-xs uppercase tracking-[0.25em] text-zinc-500">
          New password
        </span>
        <input
          type="password"
          required
          minLength={6}
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="w-full border border-white/15 bg-transparent px-4 py-3 text-white outline-none transition focus:border-panteron-violet"
        />
      </label>

      <label className="block">
        <span className="mb-2 block text-xs uppercase tracking-[0.25em] text-zinc-500">
          Confirm password
        </span>
        <input
          type="password"
          required
          minLength={6}
          autoComplete="new-password"
          value={confirm}
          onChange={(event) => setConfirm(event.target.value)}
          className="w-full border border-white/15 bg-transparent px-4 py-3 text-white outline-none transition focus:border-panteron-violet"
        />
      </label>

      {error ? <p className="text-sm text-red-400">{error}</p> : null}
      {message ? <p className="text-sm text-panteron-violet">{message}</p> : null}

      <button
        type="submit"
        disabled={busy}
        className="w-full bg-panteron-purple px-6 py-3 text-sm font-medium text-white transition hover:bg-panteron-violet disabled:opacity-60"
      >
        {busy ? "Saving…" : "Update password"}
      </button>
    </form>
  );
}
