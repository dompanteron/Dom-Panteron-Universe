import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ProductGallery from "@/components/shop/ProductGallery";
import ProductPurchasePanel from "@/components/shop/ProductPurchasePanel";
import { ensureCurrentMember } from "@/lib/members";
import {
  getProductBySlug,
  parseProductImages,
  parseProductSizes
} from "@/lib/shop/products";

type Props = {
  params: { slug: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getProductBySlug(params.slug);

  if (!product) {
    return { title: "Product | Dom Panteron Universe" };
  }

  return {
    title: `${product.title} | Collections`,
    description: product.subtitle ?? product.description ?? undefined
  };
}

export default async function ProductPage({ params }: Props) {
  const product = await getProductBySlug(params.slug);

  if (!product) {
    notFound();
  }

  const { member } = await ensureCurrentMember();
  const sizes = parseProductSizes(product.sizes);
  const images = parseProductImages(product);
  const isSold = product.status === "sold";
  const price = Number(product.price);
  return (
    <main className="text-white">
      <section className="border-b border-white/10 bg-panteron-black">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-2 text-sm text-zinc-500">
            <Link href="/collections" className="transition hover:text-panteron-violet">
              Collections
            </Link>
            <span aria-hidden>/</span>
            {product.collection ? (
              <>
                <Link
                  href={`/collections/${product.collection.slug}`}
                  className="transition hover:text-panteron-violet"
                >
                  {product.collection.name}
                </Link>
                <span aria-hidden>/</span>
              </>
            ) : null}
            <span className="text-zinc-400">{product.title}</span>
          </div>
        </div>
      </section>

      <section className="bg-panteron-black">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:py-24">
          <ProductGallery images={images} title={product.title} />

          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-panteron-violet">
              Ready-made
            </p>
            <h1 className="font-display mt-3 text-4xl font-semibold sm:text-5xl">
              {product.title}
            </h1>
            {product.subtitle ? (
              <p className="mt-4 text-xl text-zinc-300">{product.subtitle}</p>
            ) : null}

            {product.description ? (
              <div className="mt-8 border-t border-white/10 pt-8">
                <h2 className="text-xs uppercase tracking-[0.2em] text-zinc-500">Details</h2>
                <p className="mt-4 text-lg leading-relaxed text-zinc-300">{product.description}</p>
              </div>
            ) : null}

            <ProductPurchasePanel
              productSlug={product.slug}
              price={price}
              currency={product.currency}
              compareAtPrice={
                product.compare_at_price != null ? Number(product.compare_at_price) : null
              }
              sizes={sizes}
              signedIn={Boolean(member)}
              isSold={isSold}
              defaultName={member?.full_name}
              defaultEmail={member?.email}
            />
          </div>
        </div>
      </section>
    </main>
  );
}
