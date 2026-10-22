import type { Metadata } from "next";
import Link from "next/link";
import CollectionBlock from "@/components/shop/CollectionBlock";
import CollectionRevealBanner from "@/components/shop/CollectionRevealBanner";
import LineRafflesSection from "@/components/raffles/LineRafflesSection";
import RealmMusicSpotlight from "@/components/shop/RealmMusicSpotlight";
import ProductCard from "@/components/shop/ProductCard";
import { getActiveCollectionsForRealm } from "@/lib/shop/collections";
import { visibleProductsForCollection } from "@/lib/shop/collection-reveal";
import RealmEmptyState from "@/components/shop/RealmEmptyState";
import RealmHeroAtmosphere from "@/components/shop/RealmHeroAtmosphere";
import { REALM_ACCENT_CLASSES, realmShopPath } from "@/lib/shop/realms";
import { primaryCollectionSlugForRealm } from "@/lib/shop/realm-hub";
import type { RealmRow } from "@/lib/shop/types";
import { buildShareMetadata } from "@/lib/site-metadata";

export function realmHubMetadata(realm: RealmRow): Metadata {
  return buildShareMetadata({
    title: `${realm.name} | Dom Panteron Universe`,
    description: realm.description ?? realm.tagline ?? `${realm.name} — shop the universe.`,
    path: realmShopPath(realm.slug)
  });
}

export default async function RealmHubPage({ realm }: { realm: RealmRow }) {
  const accent = REALM_ACCENT_CLASSES[realm.accent];
  let collections: Awaited<ReturnType<typeof getActiveCollectionsForRealm>> = [];
  let loadError: string | null = null;

  try {
    collections = await getActiveCollectionsForRealm(realm);
  } catch (error) {
    loadError = error instanceof Error ? error.message : "Could not load this realm.";
  }

  const primarySlug = primaryCollectionSlugForRealm(realm.slug);
  const primary = collections.find((c) => c.slug === primarySlug) ?? collections[0];
  const primaryReveal = primary
    ? visibleProductsForCollection(primary, primary.products)
    : null;

  const raffleConfig = {
    productLine: realm.slug,
    navLabel: realm.name
  };

  return (
    <main className="text-white">
      <section className="relative isolate overflow-hidden bg-panteron-black">
        <div aria-hidden className="absolute inset-0 bg-panteron-gradient" />
        <RealmHeroAtmosphere accent={realm.accent} hasHeroImage={Boolean(realm.hero_image_url)} />
        {realm.hero_image_url ? (
          <div
            aria-hidden
            className="absolute inset-0 bg-cover bg-center opacity-20"
            style={{ backgroundImage: `url(${realm.hero_image_url})` }}
          />
        ) : null}

        <div className="relative z-10 mx-auto max-w-5xl px-6 py-24 text-center md:py-32">
          <Link
            href="/shop"
            className="inline-block text-sm text-zinc-400 transition hover:text-panteron-violet"
          >
            ← All realms
          </Link>
          <p className={`mt-10 text-xs uppercase tracking-[0.35em] ${accent.text}`}>
            {realm.name}
          </p>
          <h1 className="font-display mt-4 text-4xl font-semibold sm:text-5xl md:text-6xl">
            {realm.tagline ?? realm.name}
          </h1>
          {realm.description ? (
            <p className="mx-auto mt-6 max-w-2xl text-xl text-zinc-300">{realm.description}</p>
          ) : null}
          <p className="mx-auto mt-4 max-w-2xl text-base text-zinc-500">
            One membership, one checkout — this realm is its own world inside the universe.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {realm.listen_path ? (
              <Link
                href={realm.listen_path}
                className="inline-block border border-white/25 px-6 py-3 text-sm font-medium transition hover:border-panteron-violet hover:text-panteron-violet"
              >
                Listen →
              </Link>
            ) : null}
            {primary?.slug ? (
              <Link
                href={`/collections/${primary.slug}`}
                className="inline-block border border-white/25 px-6 py-3 text-sm font-medium transition hover:border-panteron-violet hover:text-panteron-violet"
              >
                View {primary.name} →
              </Link>
            ) : null}
            <Link
              href="#draws"
              className="inline-block border border-white/25 px-6 py-3 text-sm font-medium transition hover:border-panteron-violet hover:text-panteron-violet"
            >
              {realm.name} draws →
            </Link>
          </div>
        </div>
      </section>

      {realm.kind === "music" || realm.slug === "music" ? (
        <RealmMusicSpotlight listenPath={realm.listen_path} />
      ) : null}

      <section className="border-t border-white/10 bg-panteron-black">
        <div className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
          {loadError ? (
            <p className="py-20 text-center text-sm text-red-400">{loadError}</p>
          ) : collections.length === 0 ? (
            <div className="pt-16 md:pt-20">
              <RealmEmptyState realm={realm} />
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

      <LineRafflesSection config={raffleConfig} />
    </main>
  );
}
