import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import AdminCollectionForm from "@/components/admin/AdminCollectionForm";
import { requireAdmin } from "@/lib/members";
import { createAdminClient } from "@/lib/supabase/admin";

export const metadata: Metadata = {
  title: "Edit collection | Dom Panteron Universe"
};

export default async function AdminEditCollectionPage({
  params
}: {
  params: { id: string };
}) {
  await requireAdmin();
  const admin = createAdminClient();
  const [collectionResult, realmsResult] = await Promise.all([
    admin.from("collections").select("*").eq("id", params.id).maybeSingle(),
    admin.from("realms").select("id, slug, name").order("display_order", { ascending: true })
  ]);

  const { data, error } = collectionResult;
  const realms = realmsResult.data ?? [];

  if (error || !data) {
    notFound();
  }

  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <Link href="/admin/collections" className="text-sm text-zinc-400 hover:text-panteron-violet">
        ← Collections
      </Link>
      <h1 className="font-display mt-6 text-4xl font-semibold">Edit collection</h1>
      <div className="mt-12 border border-white/10 p-6 sm:p-8">
        <AdminCollectionForm collection={data} realms={realms} />
      </div>
    </section>
  );
}
