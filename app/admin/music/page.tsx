import type { Metadata } from "next";
import Link from "next/link";
import { musicReleases } from "@/lib/catalog/music";

export const metadata: Metadata = {
  title: "Admin music | Dom Panteron Universe"
};

export default function AdminMusicPage() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <p className="mb-3 text-xs uppercase tracking-[0.35em] text-panteron-violet">
        Admin
      </p>
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <h1 className="font-display text-4xl font-semibold">Music</h1>
          <p className="mt-4 max-w-2xl text-lg text-zinc-400">
            Releases currently shown on the public music page. Player embeds
            and save-to-database will plug in here later.
          </p>
        </div>
        <Link
          href="/music"
          className="border border-white/20 px-4 py-2 text-sm text-zinc-300 transition hover:border-panteron-violet hover:text-panteron-violet"
        >
          View public page
        </Link>
      </div>

      <div className="mt-12 overflow-x-auto border-y border-white/10">
        <table className="w-full min-w-[44rem] text-left">
          <thead>
            <tr className="text-xs uppercase tracking-[0.2em] text-zinc-500">
              <th className="py-4 pr-4 font-normal">Title</th>
              <th className="py-4 pr-4 font-normal">Kind</th>
              <th className="py-4 pr-4 font-normal">Status</th>
              <th className="py-4 font-normal">Note</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {musicReleases.map((release) => (
              <tr key={release.title} className="text-sm">
                <td className="py-5 pr-4 font-display text-xl text-white">
                  {release.title}
                </td>
                <td className="py-5 pr-4 uppercase tracking-[0.18em] text-zinc-500">
                  {release.kind}
                </td>
                <td className="py-5 pr-4 text-panteron-violet">{release.status}</td>
                <td className="py-5 text-zinc-400">{release.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
