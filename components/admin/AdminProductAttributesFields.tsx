"use client";

import { useMemo } from "react";
import type { ProductLine } from "@/lib/shop/product-lines";
import {
  attributeFieldsForLine,
  parseProductAttributes,
  type ProductAttributes
} from "@/lib/shop/product-attributes";

const fieldClass =
  "w-full border border-white/15 bg-transparent px-4 py-3 text-white outline-none focus:border-panteron-violet";

export default function AdminProductAttributesFields({
  productLine,
  value,
  onChange
}: {
  productLine: ProductLine | null | undefined;
  value: ProductAttributes;
  onChange: (next: ProductAttributes) => void;
}) {
  const fields = useMemo(() => attributeFieldsForLine(productLine), [productLine]);
  const parsed = parseProductAttributes(value);

  function setField(key: string, text: string) {
    onChange({ ...parsed, [key]: text });
  }

  const lineLabel =
    productLine === "champagne"
      ? "Champagne"
      : productLine === "home"
        ? "HOME"
        : productLine === "water"
          ? "Water"
          : productLine === "fashion"
            ? "Fashion"
            : "General";

  return (
    <div className="md:col-span-2 border border-white/10 p-4 sm:p-5">
      <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">
        Specifications ({lineLabel})
      </p>
      <p className="mt-2 text-sm text-zinc-500">
        Optional — shown on the product page when filled. Fields follow the collection product line.
      </p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {fields.map((field) => (
          <label key={field.key} className="block">
            <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-zinc-500">
              {field.label}
            </span>
            <input
              value={parsed[field.key] ?? ""}
              onChange={(e) => setField(field.key, e.target.value)}
              placeholder={field.placeholder}
              className={fieldClass}
            />
          </label>
        ))}
      </div>
    </div>
  );
}
