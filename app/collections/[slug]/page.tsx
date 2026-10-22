import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import CollectionRevealBanner from "@/components/shop/CollectionRevealBanner";
import ProductCard from "@/components/shop/ProductCard";
import { buildShareMetadata } from "@/lib/site-metadata";
import { getCollectionBySlug } from "@/lib/shop/collections";
import { visibleProductsForCollection } from "@/lib/shop/collection-reveal";
import { raffleLineLabel } from "@/lib/raffles/raffle-line-display";
import { shopHubHrefForLine } from "@/lib/shop/realm-ui";

type Props = {
  params: { slug: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const collection = await getCollectionBySlug(params.slug);

  if (!collection) {
    return { title: "Collection | Dom Panteron Universe" };
  }

  return buildShareMetadata({
    title: `${collection.name} | Collections`,
    description: collection.subtitle ?? collection.description,
    path: `/collections/${collection.slug}`,
    imageUrl: collection.cover_image_url
  });
}

export default async function CollectionDetailPage({ params }: Props) {
  const collection = await getCollectionBySlug(params.slug);

  if (!collection) {
    notFound();
  }

  const { reveal, products: visibleProducts } = visibleProductsForCollection(
    collection,
    collection.products
  );

  const realmHref = collection.product_line ? shopHubHrefForLine(collection.product_line) : null;
  const realmLabel = collection.product_line ? raffleLineLabel(collection.product_line) : null;

  return (
    <main className="text-white">
      <section className="relative isolate overflow-hidden bg-panteron-black">
        <div aria-hidden className="absolute inset-0 bg-panteron-gradient" />
        <div className="relative z-10 mx-auto max-w-7xl px-4 pb-12 pt-24 sm:px-6 lg:px-8 lg:pt-28">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
            {realmHref && realmLabel ? (
              <Link href={realmHref} className="text-zinc-400 transition hover:text-panteron-violet">
                ← {realmLabel} realm
              </Link>
            ) : null}
            <Link href="/shop" className="text-zinc-400 transition hover:text-panteron-violet">
              All realms
            </Link>
            <Link href="/collections" className="text-zinc-400 transition hover:text-panteron-violet">
              All collections
            </Link>
          </div>

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
          {!reveal.isLive && reveal.revealAt ? (
            <div className="mb-12">
              <CollectionRevealBanner reveal={reveal} collectionName={collection.name} />
            </div>
          ) : null}

          {visibleProducts.length === 0 ? (
            <p className="py-16 text-center text-lg text-zinc-500">
              {!reveal.showProducts && !reveal.isLive
                ? "This drop is locked until the countdown ends."
                : "No pieces in this collection yet. Check back soon."}
            </p>
          ) : (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {visibleProducts.map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  priority={index < 3}
                  previewOnly={!reveal.allowPurchase}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
