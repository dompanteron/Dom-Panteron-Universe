import type { Metadata } from "next";
import Link from "next/link";
import CollectionBlock from "@/components/shop/CollectionBlock";
import CollectionRevealBanner from "@/components/shop/CollectionRevealBanner";
import LineRafflesSection from "@/components/raffles/LineRafflesSection";
import ProductCard from "@/components/shop/ProductCard";
import { getActiveCollectionsByProductLine } from "@/lib/shop/collections";
import { visibleProductsForCollection } from "@/lib/shop/collection-reveal";
import type { ProductLineHubConfig } from "@/lib/shop/product-lines";
import { buildShareMetadata } from "@/lib/site-metadata";

export function productLineHubMetadata(config: ProductLineHubConfig): Metadata {
  return buildShareMetadata({
    title: `${config.navLabel} | Dom Panteron Universe`,
    description: config.lead,
    path: config.path
  });
}

export default async function ProductLineHubPage({
  config
}: {
  config: ProductLineHubConfig;
}) {
  let collections: Awaited<ReturnType<typeof getActiveCollectionsByProductLine>> = [];
  let loadError: string | null = null;

  try {
    collections = await getActiveCollectionsByProductLine(config.key);
  } catch (error) {
    loadError = error instanceof Error ? error.message : "Could not load this line.";
  }

  const primary = collections.find((c) => c.slug === config.primaryCollectionSlug);
  const primaryReveal = primary
    ? visibleProductsForCollection(primary, primary.products)
    : null;

  return (
    <main className="text-white">
      <section className="relative isolate overflow-hidden bg-panteron-black">
        <div aria-hidden className="absolute inset-0 bg-panteron-gradient" />
        <div
          aria-hidden
          className="home-haze absolute -right-1/4 top-0 h-[55%] w-[55%] rounded-full bg-panteron-purple/15 blur-3xl"
        />
        <div className="relative z-10 mx-auto max-w-5xl px-6 py-24 text-center md:py-32">
          <Link
            href="/collections"
            className="inline-block text-sm text-zinc-400 transition hover:text-panteron-violet"
          >
            ← All shop
          </Link>
          <p className="mt-10 text-xs uppercase tracking-[0.35em] text-panteron-violet">
            {config.eyebrow}
          </p>
          <h1 className="font-display mt-4 text-4xl font-semibold sm:text-5xl md:text-6xl">
            {config.title}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-xl text-zinc-300">{config.lead}</p>
          <p className="mx-auto mt-4 max-w-2xl text-base text-zinc-500">{config.detail}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {primary?.slug ? (
              <Link
                href={`/collections/${primary.slug}`}
                className="inline-block border border-white/25 px-6 py-3 text-sm font-medium transition hover:border-panteron-violet hover:text-panteron-violet"
              >
                View {primary.name} collection →
              </Link>
            ) : null}
            <Link
              href="#draws"
              className="inline-block border border-white/25 px-6 py-3 text-sm font-medium transition hover:border-panteron-violet hover:text-panteron-violet"
            >
              {config.navLabel} draws →
            </Link>
          </div>
        </div>
      </section>

      <section className="border-t border-white/10 bg-panteron-black">
        <div className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
          {loadError ? (
            <p className="py-20 text-center text-sm text-red-400">{loadError}</p>
          ) : collections.length === 0 ? (
            <div className="rounded-3xl border border-white/10 py-24 text-center">
              <p className="text-lg text-zinc-400">Pieces for this line are on the way.</p>
              <Link
                href="/join"
                className="mt-6 inline-block bg-panteron-purple px-6 py-3 text-sm font-medium text-white hover:bg-panteron-violet"
              >
                Join for drop alerts
              </Link>
            </div>
          ) : collections.length === 1 ? (
            <div className="pt-16 md:pt-20">
              {primaryReveal && !primaryReveal.reveal.isLive && primaryReveal.reveal.revealAt ? (
                <div className="mb-12">
                  <CollectionRevealBanner
                    reveal={primaryReveal.reveal}
                    collectionName={collections[0].name}
                  />
                </div>
              ) : null}
              {(() => {
                const { products: visibleProducts, reveal } = visibleProductsForCollection(
                  collections[0],
                  collections[0].products
                );
                if (visibleProducts.length === 0) {
                  return (
                    <p className="py-16 text-center text-lg text-zinc-500">
                      {!reveal.showProducts && !reveal.isLive
                        ? "This drop is locked until the countdown ends."
                        : "Products are being prepared — check back soon."}
                    </p>
                  );
                }
                return (
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
                );
              })()}
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

      <LineRafflesSection config={config} />
    </main>
  );
}
