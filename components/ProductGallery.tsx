"use client";

import { useMemo, useState } from "react";
import ProductImageComposite from "./ProductImageComposite";

export default function ProductGallery({ images, alt, backgroundImage }: { images: string[]; alt: string; backgroundImage?: string | null }) {
  const uniqueImages = useMemo(() => Array.from(new Set(images.filter(Boolean))), [images]);
  const [active, setActive] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const selected = uniqueImages[active] || uniqueImages[0];

  if (!selected) return null;

  return (
    <div className="grid gap-4">
      <button
        type="button"
        onClick={() => setLightboxOpen(true)}
        className="group relative aspect-square overflow-hidden rounded-[30px] bg-neutral-100 text-left shadow-soft"
        aria-label="Ampliar imagen del producto"
      >
        <ProductImageComposite productSrc={selected} backgroundImage={backgroundImage} alt={alt} variant="detail" priority sizes="(max-width: 1024px) 100vw, 50vw" productClassName="group-hover:scale-105" />
      </button>
      {uniqueImages.length > 1 && (
        <div className="grid grid-cols-4 gap-3">
          {uniqueImages.map((image, index) => (
            <button
              key={image}
              type="button"
              onClick={() => setActive(index)}
              className={`relative aspect-square overflow-hidden rounded-2xl bg-neutral-100 ring-2 transition ${
                index === active ? "ring-tecnova-red" : "ring-transparent"
              }`}
              aria-label={`Ver imagen ${index + 1}`}
            >
              <ProductImageComposite productSrc={image} backgroundImage={backgroundImage} alt={alt} variant="thumbnail" sizes="160px" />
            </button>
          ))}
        </div>
      )}
      {lightboxOpen && (
        <div className="fixed inset-0 z-[100] grid bg-black/90 p-4 sm:p-8" role="dialog" aria-modal="true" aria-label="Imagen ampliada">
          <button
            type="button"
            onClick={() => setLightboxOpen(false)}
            className="absolute right-4 top-4 z-10 rounded-full bg-white px-4 py-2 text-sm font-black text-black transition hover:bg-tecnova-red hover:text-white"
          >
            Cerrar
          </button>
          <div className="relative mx-auto aspect-square w-full max-w-[80vh] self-center overflow-hidden rounded-[28px] bg-neutral-100">
            <ProductImageComposite productSrc={selected} backgroundImage={backgroundImage} alt={alt} variant="detail" priority sizes="100vw" />
          </div>
          {uniqueImages.length > 1 && (
            <div className="mx-auto mt-4 grid w-full max-w-3xl grid-cols-4 gap-3 self-end">
              {uniqueImages.map((image, index) => (
                <button
                  key={`lightbox-${image}`}
                  type="button"
                  onClick={() => setActive(index)}
                  className={`relative aspect-square overflow-hidden rounded-xl bg-neutral-100 ring-2 transition ${index === active ? "ring-tecnova-red" : "ring-white/20"}`}
                  aria-label={`Ver imagen ampliada ${index + 1}`}
                >
                  <ProductImageComposite productSrc={image} backgroundImage={backgroundImage} alt={alt} variant="thumbnail" sizes="140px" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
