import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ProductCard from "@/components/shop/ProductCard";
import { getCollectionBySlug } from "@/lib/shop/collections";

type Props = {
  params: { slug: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const collection = await getCollectionBySlug(params.slug);

  if (!collection) {
    return { title: "Collection | Dom Panteron Universe" };
  }

  return {
    title: `${collection.name} | Collections`,
    description: collection.subtitle ?? collection.description ?? undefined
  };
}

export default async function CollectionDetailPage({ params }: Props) {
  const collection = await getCollectionBySlug(params.slug);

  if (!collection) {
    notFound();
  }

  return (
    <main className="text-white">
      <section className="relative isolate overflow-hidden bg-panteron-black">
        <div aria-hidden className="absolute inset-0 bg-panteron-gradient" />
        <div className="relative z-10 mx-auto max-w-7xl px-4 pb-12 pt-24 sm:px-6 lg:px-8 lg:pt-28">
          <Link
            href="/collections"
            className="text-sm text-zinc-400 transition hover:text-panteron-violet"
          >
            ← All collections
          </Link>

          <div className="mt-10 text-center md:mt-12">
            <p className="text-xs uppercase tracking-[0.35em] text-panteron-violet">
              Collection
            </p>
            <h1 className="font-display mt-4 text-4xl font-semibold sm:text-5xl md:text-6xl">
              {collection.name}
            </h1>
            {collection.subtitle ? (
              <p className="mx-auto mt-4 max-w-2xl text-xl text-panteron-violet">
                {collection.subtitle}
              </p>
            ) : null}
            {collection.description ? (
              <p className="mx-auto mt-4 max-w-2xl text-lg text-zinc-400">
                {collection.description}
              </p>
            ) : null}
          </div>
        </div>
      </section>

      <section className="border-t border-white/10 bg-panteron-black">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 md:py-24">
          {collection.products.length === 0 ? (
            <p className="py-16 text-center text-lg text-zinc-500">
              No pieces in this collection yet. Check back soon.
            </p>
          ) : (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {collection.products.map((product, index) => (
                <ProductCard key={product.id} product={product} priority={index < 3} />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
