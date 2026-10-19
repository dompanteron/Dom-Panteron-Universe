import type { Metadata } from "next";
import Link from "next/link";
import CollectionBlock from "@/components/shop/CollectionBlock";
import { getActiveCollectionsWithProducts } from "@/lib/shop/collections";
import { visibleProductsForCollection } from "@/lib/shop/collection-reveal";
import { productLineHubs } from "@/lib/shop/product-lines";

export const metadata: Metadata = {
  title: "Collections | Dom Panteron Universe",
  description:
    "Ready-made fashion collections from Dom Panteron — jungle-born style, no custom orders."
};

export default async function CollectionsPage() {
  let collections: Awaited<ReturnType<typeof getActiveCollectionsWithProducts>> = [];
  let loadError: string | null = null;

  try {
    collections = await getActiveCollectionsWithProducts();
  } catch (error) {
    loadError = error instanceof Error ? error.message : "Could not load collections.";
  }

  return (
    <main className="text-white">
      <section className="relative isolate overflow-hidden bg-panteron-black">
        <div aria-hidden className="absolute inset-0 bg-panteron-gradient" />
        <div
          aria-hidden
          className="home-haze absolute -left-1/4 top-0 h-[60%] w-[60%] rounded-full bg-panteron-purple/20 blur-3xl"
        />
        <div className="relative z-10 mx-auto max-w-5xl px-6 py-24 text-center md:py-32">
          <p className="text-sm uppercase tracking-[0.35em] text-panteron-violet">
            Shop
          </p>
          <h1 className="font-display mt-4 text-5xl font-semibold md:text-7xl">
            Collections
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-xl text-zinc-300">
            Fashion, champagne, HOME, and water — one checkout. Explore the drop, pick your
            size or variant, order the piece.
          </p>
          <div className="mx-auto mt-8 flex max-w-2xl flex-wrap justify-center gap-3">
            {productLineHubs.map((hub) => (
              <Link
                key={hub.path}
                href={hub.path}
                className="border border-white/20 px-4 py-2 text-sm transition hover:border-panteron-violet hover:text-panteron-violet"
              >
                {hub.navLabel}
              </Link>
            ))}
          </div>
          <p className="mx-auto mt-3 max-w-xl text-base text-zinc-500">
            Conscious streetwear grouped by mood and frequency. Same spirit as a curated
            lookbook — built for Dom Panteron.
          </p>
        </div>
      </section>

      <section className="border-t border-white/10 bg-panteron-black">
        <div className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
          {loadError ? (
            <p className="py-20 text-center text-sm text-red-400">{loadError}</p>
          ) : collections.length === 0 ? (
            <div className="rounded-3xl border border-white/10 py-24 text-center">
              <p className="text-lg text-zinc-400">No collections live yet.</p>
              <Link
                href="/join"
                className="mt-6 inline-block border border-white/25 px-6 py-3 text-sm text-white transition hover:border-panteron-violet hover:text-panteron-violet"
              >
                Join for drop alerts →
              </Link>
            </div>
          ) : (
            <div className="space-y-0">
              {collections.map((collection, index) => {
                const { products: visibleProducts } = visibleProductsForCollection(
                  collection,
                  collection.products
                );
                return (
                  <CollectionBlock
                    key={collection.id}
                    collection={collection}
                    products={visibleProducts}
                    reverse={index % 2 === 1}
                    isFirst={index === 0}
                    isLast={index === collections.length - 1}
                  />
                );
              })}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
