export function slugify(value: string, fallback = "item") {
  const slug = value
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || fallback;
}

export function parseSizesInput(value: string): string[] {
  return value
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}

export function parseImagesInput(value: string): string[] {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export function sizesToInput(sizes: unknown): string {
  if (!Array.isArray(sizes)) {
    return "";
  }
  return sizes.filter((s) => typeof s === "string").join(", ");
}

export function imagesToInput(images: unknown): string {
  if (!Array.isArray(images)) {
    return "";
  }
  return images.filter((s) => typeof s === "string").join("\n");
}
