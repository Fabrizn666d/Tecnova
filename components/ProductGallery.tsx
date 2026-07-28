"use client";

import { Minus, Plus, RotateCcw, Search } from "lucide-react";
import type { PointerEvent } from "react";
import { useMemo, useRef, useState } from "react";
import ProductImageComposite from "./ProductImageComposite";

type ProductGalleryProps = {
  images: string[];
  alt: string;
  backgroundImage?: string | null;
  imageScale?: number | null;
  imagePositionX?: number | null;
  imagePositionY?: number | null;
};

type Point = { x: number; y: number };

export default function ProductGallery({
  images,
  alt,
  backgroundImage,
  imageScale,
  imagePositionX,
  imagePositionY,
}: ProductGalleryProps) {
  const uniqueImages = useMemo(() => Array.from(new Set(images.filter(Boolean))), [images]);
  const [active, setActive] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const selected = uniqueImages[active] || uniqueImages[0];

  if (!selected) return null;

  const compositeProps = { backgroundImage, imageScale, imagePositionX, imagePositionY };

  return (
    <div className="grid gap-4">
      <ProductZoomViewer
        productSrc={selected}
        alt={alt}
        sizes="(max-width: 1024px) 100vw, 50vw"
        priority
        onOpen={() => setLightboxOpen(true)}
        {...compositeProps}
      />

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
              <ProductImageComposite productSrc={image} alt={alt} variant="thumbnail" sizes="160px" {...compositeProps} />
            </button>
          ))}
        </div>
      )}

      {lightboxOpen && (
        <div className="fixed inset-0 z-[100] grid bg-black/90 p-4 sm:p-8" role="dialog" aria-modal="true" aria-label="Imagen ampliada">
          <button
            type="button"
            onClick={() => setLightboxOpen(false)}
            className="absolute right-4 top-4 z-20 rounded-full bg-white px-4 py-2 text-sm font-black text-black transition hover:bg-tecnova-red hover:text-white"
          >
            Cerrar
          </button>
          <div className="mx-auto w-full max-w-[86vh] self-center">
            <ProductZoomViewer productSrc={selected} alt={alt} sizes="100vw" priority {...compositeProps} />
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
                  <ProductImageComposite productSrc={image} alt={alt} variant="thumbnail" sizes="140px" {...compositeProps} />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ProductZoomViewer({
  productSrc,
  alt,
  backgroundImage,
  imageScale,
  imagePositionX,
  imagePositionY,
  sizes,
  priority = false,
  onOpen,
}: {
  productSrc: string;
  alt: string;
  backgroundImage?: string | null;
  imageScale?: number | null;
  imagePositionX?: number | null;
  imagePositionY?: number | null;
  sizes: string;
  priority?: boolean;
  onOpen?: () => void;
}) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState<Point>({ x: 0, y: 0 });
  const pointers = useRef(new Map<number, Point>());
  const lastDistance = useRef<number | null>(null);
  const dragStart = useRef<Point | null>(null);

  function updateZoom(next: number) {
    const value = clamp(next, 1, 4);
    setZoom(value);
    if (value === 1) setPan({ x: 0, y: 0 });
  }

  function reset() {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    event.currentTarget.setPointerCapture(event.pointerId);
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    dragStart.current = { x: event.clientX - pan.x, y: event.clientY - pan.y };
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!pointers.current.has(event.pointerId)) return;
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    const activePointers = Array.from(pointers.current.values());

    if (activePointers.length >= 2) {
      const distance = getDistance(activePointers[0], activePointers[1]);
      if (lastDistance.current) updateZoom(zoom * (distance / lastDistance.current));
      lastDistance.current = distance;
      return;
    }

    if (zoom > 1 && dragStart.current) {
      setPan({
        x: clamp(event.clientX - dragStart.current.x, -180 * zoom, 180 * zoom),
        y: clamp(event.clientY - dragStart.current.y, -180 * zoom, 180 * zoom),
      });
    }
  }

  function onPointerEnd(event: PointerEvent<HTMLDivElement>) {
    pointers.current.delete(event.pointerId);
    lastDistance.current = null;
    dragStart.current = null;
  }

  return (
    <div
      className="group relative aspect-square overflow-hidden rounded-[30px] bg-neutral-100 text-left shadow-soft touch-none"
      onWheel={(event) => {
        event.preventDefault();
        updateZoom(zoom + (event.deltaY < 0 ? 0.18 : -0.18));
      }}
      onDoubleClick={() => updateZoom(zoom > 1 ? 1 : 2)}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerEnd}
      onPointerCancel={onPointerEnd}
    >
      <div
        className="absolute inset-0 will-change-transform"
        style={{ transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${zoom})`, transition: pointers.current.size ? "none" : "transform 180ms ease-out" }}
      >
        <ProductImageComposite
          productSrc={productSrc}
          backgroundImage={backgroundImage}
          imageScale={imageScale}
          imagePositionX={imagePositionX}
          imagePositionY={imagePositionY}
          alt={alt}
          variant="detail"
          priority={priority}
          sizes={sizes}
        />
      </div>
      <div className="absolute bottom-4 left-4 z-10 flex gap-2 rounded-full bg-white/90 p-1 shadow-sm backdrop-blur">
        <button type="button" onClick={() => updateZoom(zoom - 0.4)} className="grid h-9 w-9 place-items-center rounded-full hover:bg-neutral-100" aria-label="Reducir zoom">
          <Minus size={16} />
        </button>
        <button type="button" onClick={() => updateZoom(zoom + 0.4)} className="grid h-9 w-9 place-items-center rounded-full hover:bg-neutral-100" aria-label="Aumentar zoom">
          <Plus size={16} />
        </button>
        <button type="button" onClick={reset} className="grid h-9 w-9 place-items-center rounded-full hover:bg-neutral-100" aria-label="Restablecer zoom">
          <RotateCcw size={16} />
        </button>
      </div>
      {onOpen && (
        <button type="button" onClick={onOpen} className="absolute right-4 top-4 z-10 grid h-10 w-10 place-items-center rounded-full bg-white/90 shadow-sm backdrop-blur transition hover:bg-tecnova-red hover:text-white" aria-label="Ampliar imagen del producto">
          <Search size={17} />
        </button>
      )}
    </div>
  );
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function getDistance(first: Point, second: Point) {
  return Math.hypot(first.x - second.x, first.y - second.y);
}
