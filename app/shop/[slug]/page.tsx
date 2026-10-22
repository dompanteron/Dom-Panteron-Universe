import { notFound } from "next/navigation";
import RealmHubPage, { realmHubMetadata } from "@/components/shop/RealmHubPage";
import { getActiveRealms, getRealmBySlug } from "@/lib/shop/realms";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  try {
    const realms = await getActiveRealms();
    return realms.map((realm) => ({ slug: realm.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const realm = await getRealmBySlug(slug);
  if (!realm) {
    return { title: "Realm | Dom Panteron Universe" };
  }
  return realmHubMetadata(realm);
}

export default async function ShopRealmPage({ params }: PageProps) {
  const { slug } = await params;
  const realm = await getRealmBySlug(slug);
  if (!realm) {
    notFound();
  }
  return <RealmHubPage realm={realm} />;
}
