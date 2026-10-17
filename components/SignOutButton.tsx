"use client";

import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function SignOutButton() {
  const supabase = useMemo(() => createClient(), []);
  const [busy, setBusy] = useState(false);

  async function signOut() {
    setBusy(true);
    await supabase.auth.signOut();
    window.location.assign("/");
  }

  return (
    <button
      type="button"
      onClick={() => void signOut()}
      disabled={busy}
      className="border border-white/25 px-6 py-3 text-sm font-medium text-white transition hover:border-panteron-violet hover:text-panteron-violet disabled:opacity-60"
    >
      {busy ? "Signing out…" : "Sign out"}
    </button>
  );
}
