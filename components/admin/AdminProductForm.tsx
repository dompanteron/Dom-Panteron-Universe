"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import AdminGalleryUpload from "@/components/admin/AdminGalleryUpload";
import AdminImageUpload from "@/components/admin/AdminImageUpload";
import AdminProductAttributesFields from "@/components/admin/AdminProductAttributesFields";
import { parseProductAttributes } from "@/lib/shop/product-attributes";
import type { ProductLine } from "@/lib/shop/product-lines";
import { imagesToInput, sizesToInput } from "@/lib/shop/slug";

export type CollectionOption = { id: string; name: string; product_line: ProductLine | null };

export type ProductFormValues = {
  id?: string;
  collection_id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  price: number;
  compare_at_price: number | null;
  currency: string;
  sizes: unknown;
  images: unknown;
  main_image_url: string | null;
  display_order: number;
  status: string;
  attributes?: unknown;
  stock_quantity?: number | null;
};

const fieldClass =
  "w-full border border-white/15 bg-transparent px-4 py-3 text-white outline-none focus:border-panteron-violet";

export default function AdminProductForm({
  product,
  collections
}: {
  product?: ProductFormValues;
  collections: CollectionOption[];
}) {
  const router = useRouter();
  const isEdit = Boolean(product?.id);
  const [collectionId, setCollectionId] = useState(
    product?.collection_id ?? collections[0]?.id ?? ""
  );
  const [title, setTitle] = useState(product?.title ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [subtitle, setSubtitle] = useState(product?.subtitle ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [price, setPrice] = useState(String(product?.price ?? "0"));
  const [compareAt, setCompareAt] = useState(
    product?.compare_at_price != null ? String(product.compare_at_price) : ""
  );
  const [currency, setCurrency] = useState(product?.currency ?? "EUR");
  const [sizes, setSizes] = useState(sizesToInput(product?.sizes));
  const [mainImageUrl, setMainImageUrl] = useState(product?.main_image_url ?? "");
  const [images, setImages] = useState(imagesToInput(product?.images));
  const [displayOrder, setDisplayOrder] = useState(String(product?.display_order ?? 0));
  const [status, setStatus] = useState(product?.status ?? "draft");
  const [attributes, setAttributes] = useState(() => parseProductAttributes(product?.attributes));
  const [stockQuantity, setStockQuantity] = useState(
    product?.stock_quantity != null ? String(product.stock_quantity) : ""
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const selectedCollection = collections.find((c) => c.id === collectionId);
  const productLine = selectedCollection?.product_line ?? null;

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch(
        isEdit ? `/api/admin/products/${product?.id}` : "/api/admin/products",
        {
          method: isEdit ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            collection_id: collectionId,
            title,
            slug,
            subtitle,
            description,
            price,
            compare_at_price: compareAt,
            currency,
            sizes,
            main_image_url: mainImageUrl,
            images,
            display_order: displayOrder,
            status,
            attributes,
            stock_quantity: stockQuantity
          })
        }
      );
      const result = (await response.json()) as { ok: boolean; error?: string };

      if (!response.ok || !result.ok) {
        throw new Error(result.error || "Could not save product");
      }

      setMessage(isEdit ? "Product saved." : "Product created.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save product");
    } finally {
      setBusy(false);
    }
  }

  if (collections.length === 0) {
    return (
      <p className="text-sm text-zinc-400">Create a collection first, then add products.</p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-5 md:grid-cols-2">
      <label className="block md:col-span-2">
        <span className="mb-2 block text-xs uppercase tracking-[0.25em] text-zinc-500">Collection</span>
        <select
          required
          value={collectionId}
          onChange={(e) => setCollectionId(e.target.value)}
          className={`${fieldClass} bg-panteron-black`}
        >
          {collections.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </label>
      <label className="block md:col-span-2">
        <span className="mb-2 block text-xs uppercase tracking-[0.25em] text-zinc-500">Title</span>
        <input required value={title} onChange={(e) => setTitle(e.target.value)} className={fieldClass} />
      </label>
      <label className="block">
        <span className="mb-2 block text-xs uppercase tracking-[0.25em] text-zinc-500">Slug</span>
        <input value={slug} onChange={(e) => setSlug(e.target.value)} className={fieldClass} />
      </label>
      <label className="block">
        <span className="mb-2 block text-xs uppercase tracking-[0.25em] text-zinc-500">Display order</span>
        <input type="number" value={displayOrder} onChange={(e) => setDisplayOrder(e.target.value)} className={fieldClass} />
      </label>
      <label className="block md:col-span-2">
        <span className="mb-2 block text-xs uppercase tracking-[0.25em] text-zinc-500">Subtitle</span>
        <input value={subtitle} onChange={(e) => setSubtitle(e.target.value)} className={fieldClass} />
      </label>
      <label className="block md:col-span-2">
        <span className="mb-2 block text-xs uppercase tracking-[0.25em] text-zinc-500">Description</span>
        <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} className={fieldClass} />
      </label>
      <AdminProductAttributesFields
        productLine={productLine}
        value={attributes}
        onChange={setAttributes}
      />
      <label className="block">
        <span className="mb-2 block text-xs uppercase tracking-[0.25em] text-zinc-500">Price</span>
        <input required type="number" min="0" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} className={fieldClass} />
      </label>
      <label className="block">
        <span className="mb-2 block text-xs uppercase tracking-[0.25em] text-zinc-500">Compare at (optional)</span>
        <input type="number" min="0" step="0.01" value={compareAt} onChange={(e) => setCompareAt(e.target.value)} className={fieldClass} />
      </label>
      <label className="block">
        <span className="mb-2 block text-xs uppercase tracking-[0.25em] text-zinc-500">Currency</span>
        <input value={currency} onChange={(e) => setCurrency(e.target.value)} className={fieldClass} />
      </label>
      <label className="block">
        <span className="mb-2 block text-xs uppercase tracking-[0.25em] text-zinc-500">Status</span>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className={`${fieldClass} bg-panteron-black`}>
          <option value="draft">draft</option>
          <option value="active">active</option>
          <option value="sold">sold</option>
        </select>
      </label>
      <label className="block md:col-span-2">
        <span className="mb-2 block text-xs uppercase tracking-[0.25em] text-zinc-500">
          Stock quantity (optional)
        </span>
        <input
          type="number"
          min={0}
          value={stockQuantity}
          onChange={(e) => setStockQuantity(e.target.value)}
          className={fieldClass}
          placeholder="Leave empty for one-of-one (marks sold after payment)"
        />
        <span className="mt-2 block text-xs text-zinc-500">
          Use for water bottles or multi-unit SKUs. Empty = fashion-style single piece.
        </span>
      </label>
      <label className="block md:col-span-2">
        <span className="mb-2 block text-xs uppercase tracking-[0.25em] text-zinc-500">Sizes (comma separated)</span>
        <input value={sizes} onChange={(e) => setSizes(e.target.value)} className={fieldClass} placeholder="S, M, L, XL" />
      </label>
      <AdminImageUpload
        label="Main image"
        folder="products"
        value={mainImageUrl}
        onChange={setMainImageUrl}
        hint="Used on collection grids and product cards."
      />
      <AdminGalleryUpload value={images} onChange={setImages} />
      <div className="md:col-span-2">
        {error ? <p className="mb-4 text-sm text-red-400">{error}</p> : null}
        {message ? <p className="mb-4 text-sm text-panteron-violet">{message}</p> : null}
        <button type="submit" disabled={busy} className="bg-panteron-purple px-6 py-3 text-sm font-medium text-white hover:bg-panteron-violet disabled:opacity-60">
          {busy ? "Saving…" : isEdit ? "Save product" : "Create product"}
        </button>
      </div>
    </form>
  );
}
