export const SHOP_MEDIA_BUCKET = "shop";

export function getShopMediaPublicUrl(objectPath: string) {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
  if (!base) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
  }
  const path = objectPath.replace(/^\//, "");
  return `${base}/storage/v1/object/public/${SHOP_MEDIA_BUCKET}/${path}`;
}

const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

const EXT_BY_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif"
};

export function validateShopImageFile(file: File) {
  if (!ALLOWED_MIME.has(file.type)) {
    return { ok: false as const, error: "Use JPEG, PNG, WebP, or GIF." };
  }
  if (file.size > 5 * 1024 * 1024) {
    return { ok: false as const, error: "Image must be 5 MB or smaller." };
  }
  return { ok: true as const, ext: EXT_BY_MIME[file.type] ?? "jpg" };
}

export type ShopMediaFolder = "collections" | "products" | "music" | "realms";

export function buildShopMediaPath(folder: ShopMediaFolder, ext: string) {
  const stamp = Date.now();
  const rand = Math.random().toString(36).slice(2, 10);
  return `${folder}/${stamp}-${rand}.${ext}`;
}
