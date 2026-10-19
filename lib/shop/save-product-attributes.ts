import {
  parseProductAttributes,
  sanitizeAttributesForLine,
  type ProductAttributes
} from "@/lib/shop/product-attributes";
import type { ProductLine } from "@/lib/shop/product-lines";

export function productAttributesFromRequestBody(
  body: Record<string, unknown>,
  productLine: ProductLine | null
): ProductAttributes {
  return sanitizeAttributesForLine(parseProductAttributes(body.attributes), productLine);
}
