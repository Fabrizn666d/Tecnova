import { productBackgroundSrc } from "@/lib/image-paths";
import Image from "next/image";

type ProductImageCompositeProps = {
  productSrc: string;
  backgroundImage?: string | null;
  alt: string;
  variant?: "card" | "detail" | "thumbnail" | "admin-preview";
  productScale?: number;
  productOffsetY?: number;
  priority?: boolean;
  sizes: string;
  productClassName?: string;
  backgroundClassName?: string;
};

export default function ProductImageComposite({
  productSrc,
  backgroundImage,
  alt,
  variant = "card",
  productScale,
  productOffsetY,
  priority = false,
  sizes,
  productClassName = "",
  backgroundClassName = "",
}: ProductImageCompositeProps) {
  const backgroundSrc = productBackgroundSrc(backgroundImage);
  const productUnoptimized = isPassthroughImage(productSrc);
  const backgroundUnoptimized = isPassthroughImage(backgroundSrc);
  const usePlainProductImage = isPreviewImage(productSrc);
  const config = getVariantConfig(variant, productScale, productOffsetY);

  return (
    <div className="absolute inset-0 bg-[#f7f7f7]">
      {backgroundSrc ? (
        <>
          <div className="absolute inset-0 z-0 overflow-hidden">
            <Image
              src={backgroundSrc}
              alt=""
              fill
              sizes={sizes}
              priority={priority}
              unoptimized={backgroundUnoptimized}
              className={`object-cover object-center ${backgroundClassName}`}
            />
          </div>
          <div
            className={`absolute z-20 flex items-center justify-center ${productClassName}`}
            style={{
              top: config.top,
              right: config.right,
              bottom: config.bottom,
              left: config.left,
            }}
          >
            <div className="relative" style={{ width: config.scale, height: config.scale }}>
              {usePlainProductImage ? (
                // eslint-disable-next-line @next/next/no-img-element -- Admin previews may use blob: URLs before upload completes.
                <img
                  src={productSrc}
                  alt={alt}
                  className="absolute inset-0 h-full w-full object-contain object-center drop-shadow-[0_18px_22px_rgba(0,0,0,0.22)] transition duration-700 ease-out"
                />
              ) : (
                <Image
                  src={productSrc}
                  alt={alt}
                  fill
                  sizes={sizes}
                  priority={priority}
                  unoptimized={productUnoptimized}
                  className="object-contain object-center drop-shadow-[0_18px_22px_rgba(0,0,0,0.22)] transition duration-700 ease-out"
                />
              )}
            </div>
          </div>
        </>
      ) : (
        <div className={`absolute inset-[9%] z-10 flex items-center justify-center ${productClassName}`}>
          {usePlainProductImage ? (
            // eslint-disable-next-line @next/next/no-img-element -- Admin previews may use blob: URLs before upload completes.
            <img src={productSrc} alt={alt} className="absolute inset-0 h-full w-full object-contain object-center transition duration-700 ease-out" />
          ) : (
          <Image
            src={productSrc}
            alt={alt}
            fill
            sizes={sizes}
            priority={priority}
            unoptimized={productUnoptimized}
            className="object-contain object-center transition duration-700 ease-out"
          />
          )}
        </div>
      )}
    </div>
  );
}

function getVariantConfig(
  variant: NonNullable<ProductImageCompositeProps["variant"]>,
  productScale?: number,
  productOffsetY?: number
) {
  const scaleByVariant = {
    card: 0.68,
    detail: 0.72,
    thumbnail: 0.72,
    "admin-preview": 0.68,
  };
  const scale = clamp(productScale ?? scaleByVariant[variant], 0.45, 0.75);
  const innerScale = clamp(scale / 0.78, 0.6, 0.96);
  const offset = clamp(productOffsetY ?? (variant === "card" ? 0 : 0.05), -0.08, 0.12);
  const baseTop = variant === "card" ? 21 : variant === "thumbnail" ? 18 : 15;
  const baseBottom = variant === "card" ? 8 : variant === "thumbnail" ? 8 : 7;
  const offsetPercent = offset * 100;

  return {
    top: `${baseTop + offsetPercent}%`,
    right: variant === "card" ? "18%" : "11%",
    bottom: `${Math.max(4, baseBottom - offsetPercent)}%`,
    left: variant === "card" ? "18%" : "11%",
    scale: `${innerScale * 100}%`,
  };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function isPassthroughImage(src: string) {
  const clean = src.split("?")[0].toLowerCase();
  return clean.endsWith(".svg") || clean.endsWith(".gif");
}

function isPreviewImage(src: string) {
  return /^(blob:|data:)/i.test(src);
}
