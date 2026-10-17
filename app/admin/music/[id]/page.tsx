import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import AdminMusicReleaseForm from "@/components/admin/AdminMusicReleaseForm";
import { requireAdmin } from "@/lib/members";
import { createAdminClient } from "@/lib/supabase/admin";

export const metadata: Metadata = {
  title: "Edit release | Dom Panteron Universe"
};

export default async function AdminEditMusicReleasePage({
  params
}: {
  params: { id: string };
}) {
  await requireAdmin();
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("music_releases")
    .select("*")
    .eq("id", params.id)
    .maybeSingle();

  if (error || !data) {
    notFound();
  }

  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <Link href="/admin/music" className="text-sm text-zinc-400 hover:text-panteron-violet">
        ← Music
      </Link>
      <h1 className="font-display mt-6 text-4xl font-semibold">Edit release</h1>
      <div className="mt-12 border border-white/10 p-6 sm:p-8">
        <AdminMusicReleaseForm release={data} />
      </div>
    </section>
  );
}
