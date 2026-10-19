import type { Metadata } from "next";
import Link from "next/link";
import ResetPasswordForm from "@/components/ResetPasswordForm";

export const metadata: Metadata = {
  title: "Reset password | Dom Panteron Universe"
};

export default function ResetPasswordPage() {
  return (
    <main className="text-white">
      <section className="relative isolate overflow-hidden bg-panteron-black">
        <div aria-hidden className="absolute inset-0 bg-panteron-gradient" />
        <div className="relative z-10 mx-auto max-w-6xl px-6 pb-20 pt-24 lg:pb-28 lg:pt-28">
          <Link
            href="/join"
            className="text-sm text-zinc-400 transition hover:text-panteron-violet"
          >
            ← Back to join
          </Link>
          <p className="mt-8 text-xs uppercase tracking-[0.35em] text-panteron-violet">
            Account
          </p>
          <h1 className="font-display mt-4 max-w-xl text-4xl font-semibold sm:text-5xl">
            Set a new password
          </h1>
          <div className="mt-10 border border-white/10 bg-panteron-black/50 p-6 sm:p-8">
            <ResetPasswordForm />
          </div>
        </div>
      </section>
    </main>
  );
}
