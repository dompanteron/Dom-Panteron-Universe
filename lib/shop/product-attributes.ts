import type { ProductLine } from "@/lib/shop/product-lines";

export type ProductAttributes = Record<string, string>;

export type ProductAttributeField = {
  key: string;
  label: string;
  placeholder?: string;
};

const FASHION_FIELDS: ProductAttributeField[] = [
  { key: "material", label: "Material", placeholder: "e.g. Organic cotton" },
  { key: "care", label: "Care", placeholder: "e.g. Machine wash cold" }
];

const CHAMPAGNE_FIELDS: ProductAttributeField[] = [
  { key: "volume_ml", label: "Volume (ml)", placeholder: "750" },
  { key: "abv", label: "ABV", placeholder: "12.5%" },
  { key: "vintage", label: "Vintage", placeholder: "2020" },
  { key: "origin", label: "Origin", placeholder: "Champagne, France" }
];

const HOME_FIELDS: ProductAttributeField[] = [
  { key: "dimensions", label: "Dimensions", placeholder: "30 × 20 × 10 cm" },
  { key: "material", label: "Material", placeholder: "Ceramic, stoneware" },
  { key: "room", label: "Room / use", placeholder: "Living room, desk" }
];

const WATER_FIELDS: ProductAttributeField[] = [
  { key: "capacity_ml", label: "Capacity (ml)", placeholder: "750" },
  { key: "material", label: "Material", placeholder: "Stainless steel" },
  { key: "insulation", label: "Insulation", placeholder: "Double-wall, 12h cold" }
];

export function attributeFieldsForLine(line: ProductLine | null | undefined): ProductAttributeField[] {
  switch (line) {
    case "champagne":
      return CHAMPAGNE_FIELDS;
    case "home":
      return HOME_FIELDS;
    case "water":
      return WATER_FIELDS;
    case "fashion":
    default:
      return FASHION_FIELDS;
  }
}

export function parseProductAttributes(raw: unknown): ProductAttributes {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return {};
  }

  const out: ProductAttributes = {};
  for (const [key, value] of Object.entries(raw)) {
    if (typeof key !== "string" || !key.trim()) {
      continue;
    }
    const text = typeof value === "number" ? String(value) : String(value ?? "").trim();
    if (text) {
      out[key.trim()] = text;
    }
  }
  return out;
}

export function sanitizeAttributesForLine(
  input: ProductAttributes,
  line: ProductLine | null | undefined
): ProductAttributes {
  const allowed = new Set(attributeFieldsForLine(line).map((field) => field.key));
  const out: ProductAttributes = {};
  for (const [key, value] of Object.entries(input)) {
    if (!allowed.has(key)) {
      continue;
    }
    const text = value.trim();
    if (text) {
      out[key] = text;
    }
  }
  return out;
}

export function attributesForDisplay(
  attributes: ProductAttributes,
  line: ProductLine | null | undefined
): { label: string; value: string }[] {
  const fields = attributeFieldsForLine(line);
  const parsed = parseProductAttributes(attributes);
  return fields
    .map((field) => {
      const value = parsed[field.key];
      return value ? { label: field.label, value } : null;
    })
    .filter((row): row is { label: string; value: string } => row !== null);
}
