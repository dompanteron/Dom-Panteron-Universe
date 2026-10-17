import Image from "next/image";

type ProductImageProps = {
  src: string | null;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  fill?: boolean;
};

export default function ProductImage({
  src,
  alt,
  className = "object-cover",
  sizes = "(max-width: 768px) 90vw, 420px",
  priority,
  fill = true
}: ProductImageProps) {
  if (src) {
    return (
      <Image
        src={src}
        alt={alt}
        fill={fill}
        className={className}
        sizes={sizes}
        priority={priority}
      />
    );
  }

  return (
    <div
      className={`flex h-full w-full items-center justify-center bg-panteron-gradient ${className}`}
      aria-hidden={!alt}
    >
      <span className="font-display text-4xl text-panteron-violet/80 md:text-5xl">DP</span>
    </div>
  );
}
