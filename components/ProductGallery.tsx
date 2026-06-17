"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

export default function ProductGallery({ images, alt }: { images: string[]; alt: string }) {
  const uniqueImages = useMemo(() => Array.from(new Set(images.filter(Boolean))), [images]);
  const [active, setActive] = useState(0);
  const selected = uniqueImages[active] || uniqueImages[0];

  if (!selected) return null;

  return (
    <div className="grid gap-4">
      <div className="relative aspect-[4/3] overflow-hidden rounded-[30px] bg-neutral-100 shadow-soft">
        <Image src={selected} alt={alt} fill priority sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
      </div>
      {uniqueImages.length > 1 && (
        <div className="grid grid-cols-4 gap-3">
          {uniqueImages.map((image, index) => (
            <button
              key={image}
              type="button"
              onClick={() => setActive(index)}
              className={`relative aspect-[4/3] overflow-hidden rounded-2xl bg-neutral-100 ring-2 transition ${
                index === active ? "ring-tecnova-red" : "ring-transparent"
              }`}
              aria-label={`Ver imagen ${index + 1}`}
            >
              <Image src={image} alt={alt} fill sizes="160px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
