"use client";

import { Minus, Plus, RotateCcw, Search, X } from "lucide-react";
import type { PointerEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
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
  const openerRef = useRef<HTMLButtonElement | null>(null);
  const selected = uniqueImages[active] || uniqueImages[0];

  useEffect(() => {
    setActive(0);
    setLightboxOpen(false);
  }, [images]);

  if (!selected) return null;

  const compositeProps = { backgroundImage, imageScale, imagePositionX, imagePositionY };

  function openLightbox() {
    setLightboxOpen(true);
  }

  function closeLightbox() {
    setLightboxOpen(false);
    window.setTimeout(() => openerRef.current?.focus(), 0);
  }

  return (
    <div className="grid gap-4">
      <button
        ref={openerRef}
        type="button"
        onClick={openLightbox}
        className="group relative aspect-square cursor-zoom-in overflow-hidden rounded-[30px] bg-neutral-100 text-left shadow-soft"
        aria-label="Haz clic para ampliar la imagen del producto"
      >
        <ProductImageComposite productSrc={selected} alt={alt} variant="detail" priority sizes="(max-width: 1024px) 100vw, 50vw" {...compositeProps} />
        <span className="absolute bottom-4 left-1/2 z-10 inline-flex -translate-x-1/2 items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-xs font-black text-neutral-900 shadow-sm backdrop-blur">
          <Search size={15} /> Haz clic para ampliar
        </span>
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
              <ProductImageComposite productSrc={image} alt={alt} variant="thumbnail" sizes="160px" {...compositeProps} />
            </button>
          ))}
        </div>
      )}

      {lightboxOpen && (
        <ProductLightbox
          key={selected}
          productSrc={selected}
          alt={alt}
          onClose={closeLightbox}
          thumbnails={uniqueImages}
          active={active}
          onSelect={setActive}
          {...compositeProps}
        />
      )}
    </div>
  );
}

function ProductLightbox({
  productSrc,
  alt,
  backgroundImage,
  imageScale,
  imagePositionX,
  imagePositionY,
  thumbnails,
  active,
  onSelect,
  onClose,
}: {
  productSrc: string;
  alt: string;
  backgroundImage?: string | null;
  imageScale?: number | null;
  imagePositionX?: number | null;
  imagePositionY?: number | null;
  thumbnails: string[];
  active: number;
  onSelect: (index: number) => void;
  onClose: () => void;
}) {
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] grid bg-black/90 p-4 sm:p-8"
      role="dialog"
      aria-modal="true"
      aria-label="Imagen ampliada del producto"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <button
        ref={closeButtonRef}
        type="button"
        onClick={onClose}
        className="absolute right-4 top-4 z-30 grid h-11 w-11 place-items-center rounded-full bg-white text-black shadow-sm transition hover:bg-tecnova-red hover:text-white"
        aria-label="Cerrar imagen ampliada"
      >
        <X size={19} />
      </button>

      <div className="mx-auto grid w-full max-w-[min(92vw,92vh)] self-center" onMouseDown={(event) => event.stopPropagation()}>
        <ZoomSurface
          productSrc={productSrc}
          alt={alt}
          backgroundImage={backgroundImage}
          imageScale={imageScale}
          imagePositionX={imagePositionX}
          imagePositionY={imagePositionY}
        />
      </div>

      {thumbnails.length > 1 && (
        <div className="mx-auto mt-4 grid w-full max-w-3xl grid-cols-4 gap-3 self-end" onMouseDown={(event) => event.stopPropagation()}>
          {thumbnails.map((image, index) => (
            <button
              key={`lightbox-${image}`}
              type="button"
              onClick={() => onSelect(index)}
              className={`relative aspect-square overflow-hidden rounded-xl bg-neutral-100 ring-2 transition ${index === active ? "ring-tecnova-red" : "ring-white/20"}`}
              aria-label={`Ver imagen ampliada ${index + 1}`}
            >
              <ProductImageComposite productSrc={image} alt={alt} variant="thumbnail" sizes="140px" backgroundImage={backgroundImage} imageScale={imageScale} imagePositionX={imagePositionX} imagePositionY={imagePositionY} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ZoomSurface({
  productSrc,
  alt,
  backgroundImage,
  imageScale,
  imagePositionX,
  imagePositionY,
}: {
  productSrc: string;
  alt: string;
  backgroundImage?: string | null;
  imageScale?: number | null;
  imagePositionX?: number | null;
  imagePositionY?: number | null;
}) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState<Point>({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const pointers = useRef(new Map<number, Point>());
  const lastDistance = useRef<number | null>(null);
  const dragStart = useRef<Point | null>(null);

  useEffect(() => {
    reset();
  }, [productSrc]);

  function updateZoom(next: number) {
    const value = clamp(next, 1, 4);
    setZoom(value);
    if (value === 1) setPan({ x: 0, y: 0 });
  }

  function reset() {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setDragging(false);
    pointers.current.clear();
    lastDistance.current = null;
    dragStart.current = null;
  }

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    event.currentTarget.setPointerCapture(event.pointerId);
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (zoom > 1) {
      setDragging(true);
      dragStart.current = { x: event.clientX - pan.x, y: event.clientY - pan.y };
    }
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
      const limit = 220 * zoom;
      setPan({
        x: clamp(event.clientX - dragStart.current.x, -limit, limit),
        y: clamp(event.clientY - dragStart.current.y, -limit, limit),
      });
    }
  }

  function onPointerEnd(event: PointerEvent<HTMLDivElement>) {
    pointers.current.delete(event.pointerId);
    if (pointers.current.size < 2) lastDistance.current = null;
    if (pointers.current.size === 0) {
      dragStart.current = null;
      setDragging(false);
    }
  }

  return (
    <div
      className={`relative aspect-square overflow-hidden rounded-[28px] bg-neutral-100 touch-none ${zoom > 1 ? (dragging ? "cursor-grabbing" : "cursor-grab") : "cursor-zoom-in"}`}
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
        className="absolute inset-0 motion-safe:transition-transform motion-safe:duration-200 motion-safe:ease-out will-change-transform"
        style={{ transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${zoom})`, transition: dragging ? "none" : undefined }}
      >
        <ProductImageComposite
          productSrc={productSrc}
          backgroundImage={backgroundImage}
          imageScale={imageScale}
          imagePositionX={imagePositionX}
          imagePositionY={imagePositionY}
          alt={alt}
          variant="detail"
          priority
          sizes="100vw"
        />
      </div>
      <div className="absolute bottom-4 left-4 z-20 flex gap-2 rounded-full bg-white/90 p-1 shadow-sm backdrop-blur">
        <button type="button" onClick={() => updateZoom(zoom - 0.35)} className="grid h-9 w-9 place-items-center rounded-full hover:bg-neutral-100" aria-label="Reducir zoom">
          <Minus size={16} />
        </button>
        <button type="button" onClick={() => updateZoom(zoom + 0.35)} className="grid h-9 w-9 place-items-center rounded-full hover:bg-neutral-100" aria-label="Aumentar zoom">
          <Plus size={16} />
        </button>
        <button type="button" onClick={reset} className="grid h-9 w-9 place-items-center rounded-full hover:bg-neutral-100" aria-label="Restablecer zoom">
          <RotateCcw size={16} />
        </button>
      </div>
    </div>
  );
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function getDistance(first: Point, second: Point) {
  return Math.hypot(first.x - second.x, first.y - second.y);
}
