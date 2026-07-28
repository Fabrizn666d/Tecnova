import { productBackgroundSrc } from "@/lib/image-paths";
import Image from "next/image";
import type { CSSProperties } from "react";

type ProductImageCompositeProps = {
  productSrc: string;
  backgroundImage?: string | null;
  alt: string;
  variant?: "card" | "detail" | "thumbnail" | "admin-preview";
  productScale?: number;
  productOffsetY?: number;
  imageScale?: number | null;
  imagePositionX?: number | null;
  imagePositionY?: number | null;
  enableHoverZoom?: boolean;
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
  imageScale,
  imagePositionX,
  imagePositionY,
  enableHoverZoom = false,
  priority = false,
  sizes,
  productClassName = "",
  backgroundClassName = "",
}: ProductImageCompositeProps) {
  const backgroundSrc = productBackgroundSrc(backgroundImage);
  const productUnoptimized = isPassthroughImage(productSrc);
  const backgroundUnoptimized = isPassthroughImage(backgroundSrc);
  const usePlainProductImage = isPreviewImage(productSrc);
  const config = getVariantConfig(variant, productScale, productOffsetY, imageScale, imagePositionX, imagePositionY);
  const imageBoxClassName = [
    "relative h-full w-full scale-[var(--product-image-scale)] transition duration-700 ease-out",
    enableHoverZoom ? "group-hover:scale-[calc(var(--product-image-scale)*1.05)]" : "",
    productClassName,
  ]
    .filter(Boolean)
    .join(" ");

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
            className="absolute z-20"
            style={{
              left: config.positionX,
              top: config.positionY,
              width: config.boxSize,
              height: config.boxSize,
              transform: "translate(-50%, -50%)",
            }}
          >
            <div className={imageBoxClassName} style={{ "--product-image-scale": config.scale } as ProductImageStyle}>
              {usePlainProductImage ? (
                // eslint-disable-next-line @next/next/no-img-element -- Admin previews may use blob: URLs before upload completes.
                <img
                  src={productSrc}
                  alt={alt}
                  className="absolute inset-0 h-full w-full object-contain object-center drop-shadow-[0_18px_22px_rgba(0,0,0,0.22)]"
                />
              ) : (
                <Image
                  src={productSrc}
                  alt={alt}
                  fill
                  sizes={sizes}
                  priority={priority}
                  unoptimized={productUnoptimized}
                  className="object-contain object-center drop-shadow-[0_18px_22px_rgba(0,0,0,0.22)]"
                />
              )}
            </div>
          </div>
        </>
      ) : (
        <div
          className="absolute z-10"
          style={{
            left: config.positionX,
            top: config.positionY,
            width: config.boxSize,
            height: config.boxSize,
            transform: "translate(-50%, -50%)",
          }}
        >
          <div className={imageBoxClassName} style={{ "--product-image-scale": config.scale } as ProductImageStyle}>
          {usePlainProductImage ? (
            // eslint-disable-next-line @next/next/no-img-element -- Admin previews may use blob: URLs before upload completes.
            <img src={productSrc} alt={alt} className="absolute inset-0 h-full w-full object-contain object-center" />
          ) : (
          <Image
            src={productSrc}
            alt={alt}
            fill
            sizes={sizes}
            priority={priority}
            unoptimized={productUnoptimized}
            className="object-contain object-center"
          />
          )}
          </div>
        </div>
      )}
    </div>
  );
}

function getVariantConfig(
  variant: NonNullable<ProductImageCompositeProps["variant"]>,
  productScale?: number,
  productOffsetY?: number,
  imageScale?: number | null,
  imagePositionX?: number | null,
  imagePositionY?: number | null
) {
  const scaleByVariant = {
    card: 0.68,
    detail: 0.72,
    thumbnail: 0.72,
    "admin-preview": 0.68,
  };
  const baseScale = clamp(productScale ?? scaleByVariant[variant], 0.45, 0.8);
  const scale = clamp(imageScale ?? 1, 0.4, 2.5);
  const offset = clamp(productOffsetY ?? (variant === "card" ? 0 : 0.05), -0.08, 0.12);
  const defaultY = variant === "card" ? 58 : variant === "thumbnail" ? 56 : 55;
  const positionX = clamp(imagePositionX ?? 50, 0, 100);
  const positionY = clamp(imagePositionY ?? defaultY + offset * 100, 0, 100);

  return {
    positionX: `${positionX}%`,
    positionY: `${positionY}%`,
    boxSize: `${baseScale * 100}%`,
    scale,
  };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

type ProductImageStyle = CSSProperties & {
  "--product-image-scale": number;
};

function isPassthroughImage(src: string) {
  const clean = src.split("?")[0].toLowerCase();
  return clean.endsWith(".svg") || clean.endsWith(".gif");
}

function isPreviewImage(src: string) {
  return /^(blob:|data:)/i.test(src);
}
