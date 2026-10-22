import type { Metadata } from "next";
import Link from "next/link";
import AdminRealmForm from "@/components/admin/AdminRealmForm";
import { requireAdmin } from "@/lib/members";
import type { RealmRow } from "@/lib/shop/types";
import { createAdminClient } from "@/lib/supabase/admin";

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  return { title: `Edit realm ${id.slice(0, 8)}… | Admin` };
}

export default async function AdminRealmEditPage({ params }: PageProps) {
  await requireAdmin();
  const { id } = await params;
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("realms")
    .select(
      "id, slug, name, tagline, description, hero_image_url, accent, display_order, status, kind, listen_path, created_at"
    )
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    return (
      <section className="mx-auto max-w-3xl px-6 py-16">
        <p className="text-red-400">{error?.message ?? "Realm not found."}</p>
        <Link href="/admin/realms" className="mt-6 inline-block text-panteron-violet">
          ← Realms
        </Link>
      </section>
    );
  }

  const realm = data as RealmRow;

  return (
    <section className="mx-auto max-w-3xl px-6 py-16">
      <Link href="/admin/realms" className="text-sm text-zinc-400 hover:text-panteron-violet">
        ← Realms
      </Link>
      <h1 className="font-display mt-6 text-3xl font-semibold">Edit {realm.name}</h1>
      <div className="mt-10 border border-white/10 p-6 sm:p-8">
        <AdminRealmForm realm={realm} />
      </div>
    </section>
  );
}
