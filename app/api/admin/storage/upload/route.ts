import { NextResponse } from "next/server";
import { ensureCurrentMember } from "@/lib/members";
import {
  buildShopMediaPath,
  getShopMediaPublicUrl,
  SHOP_MEDIA_BUCKET,
  validateShopImageFile,
  type ShopMediaFolder
} from "@/lib/storage/shop-media";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const { user, member } = await ensureCurrentMember();
  if (!user || member?.role !== "admin") {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }

  const form = await request.formData();
  const file = form.get("file");
  const folderRaw = String(form.get("folder") ?? "products");

  if (!(file instanceof File)) {
    return NextResponse.json({ ok: false, error: "Choose an image file." }, { status: 400 });
  }

  let folder: ShopMediaFolder = "products";
  if (folderRaw === "collections") folder = "collections";
  else if (folderRaw === "music") folder = "music";
  else if (folderRaw === "realms") folder = "realms";
  const validated = validateShopImageFile(file);
  if (!validated.ok) {
    return NextResponse.json({ ok: false, error: validated.error }, { status: 400 });
  }

  const objectPath = buildShopMediaPath(folder, validated.ext);
  const buffer = Buffer.from(await file.arrayBuffer());
  const admin = createAdminClient();

  const { error } = await admin.storage.from(SHOP_MEDIA_BUCKET).upload(objectPath, buffer, {
    contentType: file.type,
    cacheControl: "3600",
    upsert: false
  });

  if (error) {
    return NextResponse.json(
      { ok: false, error: error.message || "Upload failed." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    ok: true,
    path: objectPath,
    publicUrl: getShopMediaPublicUrl(objectPath)
  });
}
