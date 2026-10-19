import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ProductAttributesList from "@/components/shop/ProductAttributesList";
import ProductGallery from "@/components/shop/ProductGallery";
import ProductPurchasePanel from "@/components/shop/ProductPurchasePanel";
import { productLineHubs } from "@/lib/shop/product-lines";
import { ensureCurrentMember } from "@/lib/members";
import { getPaymentOptionsForUi } from "@/lib/payments/payment-providers";
import { getCollectionRevealState } from "@/lib/shop/collection-reveal";
import { buildShareMetadata } from "@/lib/site-metadata";
import { collectionCheckoutRules } from "@/lib/shop/checkout-rules";
import { isProductAvailableForPurchase } from "@/lib/shop/product-availability";
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

  const shareImage = parseProductImages(product)[0] ?? null;

  return buildShareMetadata({
    title: `${product.title} | Collections`,
    description: product.subtitle ?? product.description,
    path: `/products/${product.slug}`,
    imageUrl: shareImage
  });
}

export default async function ProductPage({ params }: Props) {
  const product = await getProductBySlug(params.slug);

  if (!product) {
    notFound();
  }

  const { member } = await ensureCurrentMember();
  const sizes = parseProductSizes(product.sizes);
  const images = parseProductImages(product);
  const isSold = !isProductAvailableForPurchase(product);
  const checkoutRules = collectionCheckoutRules(product.collection);
  const price = Number(product.price);
  const paymentOptions = getPaymentOptionsForUi();
  const purchaseLocked = product.collection
    ? !getCollectionRevealState(product.collection).allowPurchase
    : false;

  const line = product.collection?.product_line ?? null;
  const lineHub =
    line && line !== "fashion" ? productLineHubs.find((hub) => hub.key === line) : null;
  const lineEyebrow =
    line === "champagne"
      ? "Champagne"
      : line === "home"
        ? "HOME"
        : line === "water"
          ? "Water"
          : "Ready-made";

  return (
    <main className="text-white">
      <section className="border-b border-white/10 bg-panteron-black">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-2 text-sm text-zinc-500">
            <Link href="/collections" className="transition hover:text-panteron-violet">
              Shop
            </Link>
            <span aria-hidden>/</span>
            {lineHub ? (
              <>
                <Link href={lineHub.path} className="transition hover:text-panteron-violet">
                  {lineHub.navLabel}
                </Link>
                <span aria-hidden>/</span>
              </>
            ) : null}
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
            <p className="text-xs uppercase tracking-[0.35em] text-panteron-violet">{lineEyebrow}</p>
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

            <ProductAttributesList attributes={product.attributes} productLine={line} />

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
              paymentSumup={paymentOptions.sumup}
              paymentPaypal={paymentOptions.paypal}
              purchaseLocked={purchaseLocked}
              checkoutRules={checkoutRules}
              stockQuantity={product.stock_quantity}
            />
          </div>
        </div>
      </section>
    </main>
  );
}
