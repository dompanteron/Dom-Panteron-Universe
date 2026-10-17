"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import ProductImage from "@/components/shop/ProductImage";
import type { CollectionRow, ProductRow } from "@/lib/shop/types";
import { productImageUrl } from "@/lib/shop/product-images";

const CYCLE_MS = 4000;

function formatCountdown(ms: number) {
  const days = Math.floor(ms / 86400000);
  const hours = Math.floor((ms % 86400000) / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return { days, hours, minutes, seconds };
}

function ThumbButton({
  src,
  index,
  activeIndex,
  onSelect,
  label,
  fixed
}: {
  src: string | null;
  index: number;
  activeIndex: number;
  onSelect: (index: number) => void;
  label: string;
  fixed?: boolean;
}) {
  const sizeClass = fixed ? "h-24 w-24 flex-shrink-0 md:h-28 md:w-28" : "aspect-square w-full";

  return (
    <button
      type="button"
      onClick={() => onSelect(index)}
      className={`relative overflow-hidden ${sizeClass} transition-all duration-300 ${
        activeIndex === index
          ? "ring-2 ring-panteron-violet ring-offset-2 ring-offset-panteron-black scale-105"
          : "opacity-80 hover:opacity-100"
      }`}
    >
      <ProductImage src={src} alt={label} sizes="112px" />
    </button>
  );
}

export default function CollectionBlock({
  collection,
  products,
  reverse,
  isFirst,
  isLast
}: {
  collection: CollectionRow;
  products: ProductRow[];
  reverse: boolean;
  isFirst: boolean;
  isLast: boolean;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [now, setNow] = useState(() => Date.now());

  const revealAt = collection.reveal_at ? new Date(collection.reveal_at).getTime() : null;
  const isRevealed = !revealAt || revealAt <= now;
  const msLeft = revealAt && revealAt > now ? revealAt - now : 0;

  useEffect(() => {
    if (msLeft <= 0) {
      return;
    }
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [msLeft]);

  const imageItems = products.map((product) => ({
    src: productImageUrl(product),
    label: product.title
  }));
  const count = imageItems.length;
  const row1 = imageItems.slice(0, 4);
  const row2 = imageItems.slice(4, 8);
  const row3 = imageItems.slice(8);
  const showItems = isRevealed || (collection.show_items_during_countdown && count > 0);

  useEffect(() => {
    if (count <= 1) {
      return;
    }
    const timer = setInterval(() => {
      setActiveIndex((value) => (value + 1) % count);
    }, CYCLE_MS);
    return () => clearInterval(timer);
  }, [count]);

  const bgClass = reverse ? "bg-panteron-deep" : "bg-panteron-black";
  const roundedClass = [
    isFirst && !isLast && "rounded-t-3xl",
    !isFirst && isLast && "rounded-b-3xl",
    isFirst && isLast && "rounded-3xl"
  ]
    .filter(Boolean)
    .join(" ");

  const textCol = (
    <div className="flex flex-col justify-center px-4 py-8 md:px-8 md:py-12 lg:px-12">
      <h2 className="font-display text-3xl font-semibold leading-tight text-white md:text-4xl lg:text-5xl">
        {collection.name}
      </h2>
      {collection.subtitle ? (
        <p className="mt-3 text-xl text-panteron-violet md:text-2xl">{collection.subtitle}</p>
      ) : null}
      {collection.description ? (
        <p className="mt-4 max-w-lg text-lg leading-relaxed text-zinc-400">
          {collection.description}
        </p>
      ) : null}
      <Link
        href={`/collections/${collection.slug}`}
        className="group mt-6 inline-flex w-fit items-center gap-2 bg-panteron-purple px-8 py-4 text-sm font-medium text-white transition hover:bg-panteron-violet"
      >
        Explore collection
        <span className="transition group-hover:translate-x-1" aria-hidden>
          →
        </span>
      </Link>
      {count === 0 && !revealAt ? (
        <p className="mt-4 text-lg italic text-zinc-500">Coming soon</p>
      ) : null}
      {!isRevealed && msLeft > 0 ? (
        <div className="mt-6 flex flex-wrap gap-4">
          {(() => {
            const { days, hours, minutes, seconds } = formatCountdown(msLeft);
            return (
              <>
                {[
                  ["Days", days],
                  ["Hours", hours],
                  ["Min", minutes],
                  ["Sec", seconds]
                ].map(([label, value]) => (
                  <div key={label as string} className="flex flex-col items-center">
                    <span className="font-display text-2xl tabular-nums text-white md:text-3xl">
                      {value as number}
                    </span>
                    <span className="text-xs uppercase tracking-wider text-zinc-500">
                      {label as string}
                    </span>
                  </div>
                ))}
              </>
            );
          })()}
        </div>
      ) : null}
      {showItems && (row1.length > 0 || row2.length > 0) ? (
        <div className="mt-6 space-y-3 md:hidden">
          {row1.length > 0 ? (
            <div className="grid grid-cols-4 gap-2">
              {row1.map((item, index) => (
                <ThumbButton
                  key={item.label}
                  src={item.src}
                  index={index}
                  activeIndex={activeIndex}
                  onSelect={setActiveIndex}
                  label={item.label}
                />
              ))}
            </div>
          ) : null}
          {row2.length > 0 ? (
            <div className="grid grid-cols-4 gap-2">
              {row2.map((item, index) => (
                <ThumbButton
                  key={item.label}
                  src={item.src}
                  index={index + 4}
                  activeIndex={activeIndex}
                  onSelect={setActiveIndex}
                  label={item.label}
                />
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );

  const mainImageCol =
    count > 0 && showItems ? (
      <div className="relative flex min-h-[320px] items-center justify-center p-6 md:min-h-[400px] md:p-10">
        <div className="relative aspect-square w-full max-w-md overflow-hidden border border-white/10 bg-panteron-black">
          {imageItems.map((item, index) => (
            <div
              key={item.label}
              className={`absolute inset-0 transition-opacity duration-500 ${
                activeIndex === index ? "z-10 opacity-100" : "z-0 opacity-0"
              }`}
            >
              <ProductImage src={item.src} alt={item.label} priority={index === 0} />
            </div>
          ))}
        </div>
      </div>
    ) : null;

  return (
    <section
      className={`relative flex flex-col overflow-hidden border border-white/10 ${bgClass} ${roundedClass} ${
        !isFirst ? "border-t-0" : ""
      }`}
    >
      <div className="absolute right-4 top-4 z-10 border border-white/10 bg-panteron-black/90 px-4 py-3 text-center backdrop-blur-sm md:right-6 md:top-6">
        <span className="font-display block text-3xl tabular-nums text-white md:text-4xl">
          {products.length}
        </span>
        <span className="mt-0.5 block text-xs uppercase tracking-wider text-zinc-500">
          Pieces
        </span>
      </div>

      <div
        className={
          !showItems || count === 0
            ? "flex min-h-[280px] items-center md:min-h-[320px]"
            : "grid min-h-[420px] items-stretch gap-0 md:min-h-[480px] md:grid-cols-[1fr_1.2fr]"
        }
      >
        {!showItems || count === 0 ? (
          <div className="flex w-full justify-center md:justify-start">{textCol}</div>
        ) : reverse ? (
          <>
            <div className="order-2 md:order-1">{textCol}</div>
            <div className="order-1 md:order-2">{mainImageCol}</div>
          </>
        ) : (
          <>
            <div>{mainImageCol}</div>
            <div>{textCol}</div>
          </>
        )}
      </div>

      {showItems && row3.length > 0 ? (
        <div className="border-t border-white/10 px-4 py-4 md:px-12 md:py-6">
          <div className="flex flex-wrap gap-3">
            {row3.map((item, index) => (
              <ThumbButton
                key={item.label}
                src={item.src}
                index={index + 8}
                activeIndex={activeIndex}
                onSelect={setActiveIndex}
                label={item.label}
                fixed
              />
            ))}
          </div>
        </div>
      ) : null}

      {showItems && count > 0 ? (
        <div className="hidden border-t border-white/10 px-4 py-4 md:block md:px-12 md:py-6">
          <div className="space-y-3">
            {row1.length > 0 ? (
              <div className="grid grid-cols-4 gap-3">
                {row1.map((item, index) => (
                  <ThumbButton
                    key={item.label}
                    src={item.src}
                    index={index}
                    activeIndex={activeIndex}
                    onSelect={setActiveIndex}
                    label={item.label}
                  />
                ))}
              </div>
            ) : null}
            {row2.length > 0 ? (
              <div className="grid grid-cols-4 gap-3">
                {row2.map((item, index) => (
                  <ThumbButton
                    key={item.label}
                    src={item.src}
                    index={index + 4}
                    activeIndex={activeIndex}
                    onSelect={setActiveIndex}
                    label={item.label}
                  />
                ))}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </section>
  );
}
