import Link from "next/link";
import ProductImage from "@/components/shop/ProductImage";
import { formatProductPrice } from "@/lib/shop/format-price";
import { productImageUrl } from "@/lib/shop/product-images";
import type { ProductRow } from "@/lib/shop/types";

export default function ProductCard({
  product,
  priority,
  previewOnly
}: {
  product: ProductRow;
  priority?: boolean;
  previewOnly?: boolean;
}) {
  const mainSrc = productImageUrl(product);
  const hoverSrc =
    product.images?.find((url, index) => index > 0 && url?.trim())?.trim() || null;
  const isSold = product.status === "sold";
  const price = Number(product.price);
  const compareAt =
    product.compare_at_price != null ? Number(product.compare_at_price) : null;
  const showCompare = compareAt != null && compareAt > price;

  const cardInner = (
    <>
      <div className="relative h-96 w-full overflow-hidden bg-panteron-black">
        <div
          className={`absolute inset-0 transition-opacity duration-500 ${
            hoverSrc ? "opacity-100 group-hover:opacity-0" : "opacity-100"
          }`}
        >
          <ProductImage
            src={mainSrc}
            alt={product.title}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={priority}
            className="object-cover transition-transform duration-300 group-hover:scale-110"
          />
        </div>
        {hoverSrc ? (
          <div className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
            <ProductImage
              src={hoverSrc}
              alt={product.title}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority={priority}
              className="object-cover transition-transform duration-300 group-hover:scale-110"
            />
          </div>
        ) : null}
        {isSold ? (
          <div className="pointer-events-none absolute left-4 top-4 z-20">
            <span className="font-display text-3xl font-semibold uppercase tracking-wider text-panteron-violet md:text-4xl">
              Sold
            </span>
          </div>
        ) : null}
        {previewOnly && !isSold ? (
          <div className="pointer-events-none absolute left-4 top-4 z-20">
            <span className="bg-panteron-black/80 px-3 py-1 text-xs uppercase tracking-[0.2em] text-panteron-violet">
              Drops soon
            </span>
          </div>
        ) : null}
      </div>
      <div className="p-6">
        <h2 className="font-display text-xl text-white">{product.title}</h2>
        {product.subtitle ? (
          <p className="mt-2 text-sm text-zinc-400">{product.subtitle}</p>
        ) : null}
        <p className="mt-3 text-2xl font-medium text-white">
          {formatProductPrice(price, product.currency)}
        </p>
        {showCompare ? (
          <p className="text-sm text-zinc-500 line-through">
            {formatProductPrice(compareAt, product.currency)}
          </p>
        ) : null}
      </div>
    </>
  );

  if (isSold || previewOnly) {
    return (
      <div
        className={`overflow-hidden border border-white/10 bg-panteron-deep ${
          isSold ? "opacity-90" : ""
        }`}
      >
        {cardInner}
      </div>
    );
  }

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group block overflow-hidden border border-white/10 bg-panteron-deep transition hover:border-panteron-violet/50"
    >
      {cardInner}
    </Link>
  );
}
