import type { Metadata } from "next";
import Link from "next/link";
import AdminMusicReleaseForm from "@/components/admin/AdminMusicReleaseForm";
import { requireAdmin } from "@/lib/members";
import { createAdminClient } from "@/lib/supabase/admin";

export const metadata: Metadata = {
  title: "Admin music | Dom Panteron Universe"
};

export default async function AdminMusicPage() {
  await requireAdmin();
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("music_releases")
    .select("id, title, slug, kind, phase_label, status, display_order")
    .order("display_order", { ascending: true });

  const releases = data ?? [];

  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <p className="mb-3 text-xs uppercase tracking-[0.35em] text-panteron-violet">Admin</p>
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <h1 className="font-display text-4xl font-semibold">Music</h1>
          <p className="mt-4 max-w-2xl text-lg text-zinc-400">
            Releases on the public music page. Set status to active when they should appear.
          </p>
        </div>
        <Link
          href="/music"
          className="border border-white/20 px-4 py-2 text-sm text-zinc-300 transition hover:border-panteron-violet hover:text-panteron-violet"
        >
          View public page
        </Link>
      </div>

      <div className="mt-12 border border-white/10 p-6 sm:p-8">
        <h2 className="font-display text-2xl">New release</h2>
        <div className="mt-6">
          <AdminMusicReleaseForm />
        </div>
      </div>

      {error ? (
        <p className="mt-10 text-sm text-red-400">{error.message}</p>
      ) : releases.length === 0 ? (
        <p className="mt-10 text-zinc-400">No releases yet.</p>
      ) : (
        <div className="mt-12 overflow-x-auto border-y border-white/10">
          <table className="w-full min-w-[44rem] text-left">
            <thead>
              <tr className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                <th className="py-4 pr-4 font-normal">Title</th>
                <th className="py-4 pr-4 font-normal">Kind</th>
                <th className="py-4 pr-4 font-normal">Phase</th>
                <th className="py-4 pr-4 font-normal">Status</th>
                <th className="py-4 font-normal"> </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {releases.map((row) => (
                <tr key={row.id} className="text-sm text-zinc-300">
                  <td className="py-4 pr-4 font-display text-xl text-white">{row.title}</td>
                  <td className="py-4 pr-4 uppercase tracking-[0.15em] text-zinc-500">{row.kind}</td>
                  <td className="py-4 pr-4 text-panteron-violet">{row.phase_label}</td>
                  <td className="py-4 pr-4">{row.status}</td>
                  <td className="py-4">
                    <Link href={`/admin/music/${row.id}`} className="text-panteron-violet hover:text-white">
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
