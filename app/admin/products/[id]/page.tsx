import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import AdminProductForm from "@/components/admin/AdminProductForm";
import { requireAdmin } from "@/lib/members";
import { createAdminClient } from "@/lib/supabase/admin";

export const metadata: Metadata = {
  title: "Edit product | Dom Panteron Universe"
};

export default async function AdminEditProductPage({
  params
}: {
  params: { id: string };
}) {
  await requireAdmin();
  const admin = createAdminClient();

  const [{ data: product, error }, { data: collections }] = await Promise.all([
    admin.from("products").select("*").eq("id", params.id).maybeSingle(),
    admin.from("collections").select("id, name").order("display_order", { ascending: true })
  ]);

  if (error || !product) {
    notFound();
  }

  const collectionOptions = (collections ?? []).map((c) => ({ id: c.id, name: c.name }));

  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <Link href="/admin/products" className="text-sm text-zinc-400 hover:text-panteron-violet">
        ← Products
      </Link>
      <h1 className="font-display mt-6 text-4xl font-semibold">Edit product</h1>
      <div className="mt-12 border border-white/10 p-6 sm:p-8">
        <AdminProductForm product={product} collections={collectionOptions} />
      </div>
    </section>
  );
}
