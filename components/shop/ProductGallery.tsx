"use client";

import { useState } from "react";
import ProductImage from "@/components/shop/ProductImage";

export default function ProductGallery({
  images,
  title
}: {
  images: string[];
  title: string;
}) {
  const gallery = images.length > 0 ? images : [null];
  const [activeIndex, setActiveIndex] = useState(0);
  const activeSrc = gallery[activeIndex] ?? null;

  return (
    <div className="space-y-4">
      <div className="relative aspect-[4/5] w-full overflow-hidden border border-white/10 bg-panteron-black">
        <ProductImage
          src={activeSrc}
          alt={title}
          sizes="(max-width: 1024px) 100vw, 50vw"
          priority
        />
      </div>
      {gallery.length > 1 ? (
        <div className="grid grid-cols-4 gap-3 sm:grid-cols-5">
          {gallery.map((src, index) => (
            <button
              key={`${src ?? "placeholder"}-${index}`}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`relative aspect-square overflow-hidden border transition ${
                activeIndex === index
                  ? "border-panteron-violet"
                  : "border-white/10 opacity-80 hover:opacity-100"
              }`}
            >
              <ProductImage src={src} alt={`${title} ${index + 1}`} sizes="120px" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
