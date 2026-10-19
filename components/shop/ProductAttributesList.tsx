import type { ProductLine } from "@/lib/shop/product-lines";
import { attributesForDisplay, parseProductAttributes } from "@/lib/shop/product-attributes";

export default function ProductAttributesList({
  attributes,
  productLine
}: {
  attributes: unknown;
  productLine: ProductLine | null | undefined;
}) {
  const rows = attributesForDisplay(parseProductAttributes(attributes), productLine);

  if (rows.length === 0) {
    return null;
  }

  return (
    <div className="mt-8 border-t border-white/10 pt-8">
      <h2 className="text-xs uppercase tracking-[0.2em] text-zinc-500">Specifications</h2>
      <dl className="mt-4 divide-y divide-white/10 border border-white/10">
        {rows.map((row) => (
          <div key={row.label} className="grid grid-cols-2 gap-4 px-4 py-3 text-sm sm:grid-cols-[11rem_1fr]">
            <dt className="text-zinc-500">{row.label}</dt>
            <dd className="text-zinc-200">{row.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
