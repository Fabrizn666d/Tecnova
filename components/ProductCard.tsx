"use client";

import type { CatalogCard } from "@/lib/catalog-types";
import { formatPrice } from "@/lib/format";
import { addCompareItem, addQuoteItem } from "@/lib/quote-storage";
import { GitCompare, MessageCircle, Plus, ShoppingCart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

function itemHref(item: CatalogCard) {
  return item.tipo === "repuesto" ? `/repuestos/${item.slug}` : `/productos/${item.slug}`;
}

function storagePayload(item: CatalogCard) {
  return {
    id: item.id,
    tipo: item.tipo,
    nombre: item.nombre,
    slug: item.slug,
    marca: item.marca,
    modelo: item.modelo,
    categoria: item.categoria,
    imagen: item.imagen,
    precio: item.precio,
    disponible: item.disponible,
  };
}

export default function ProductCard({
  item,
  view = "grid",
}: {
  item: CatalogCard;
  view?: "grid" | "list";
}) {
  const [added, setAdded] = useState(false);
  const [compared, setCompared] = useState(false);
  const href = itemHref(item);

  function addToQuote() {
    addQuoteItem(storagePayload(item));
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1300);
  }

  function addToCompare() {
    addCompareItem(storagePayload(item));
    setCompared(true);
    window.setTimeout(() => setCompared(false), 1300);
  }

  return (
    <article
      className={`group overflow-hidden rounded-[26px] bg-white shadow-soft ring-1 ring-black/5 transition hover:-translate-y-1 hover:shadow-lift ${
        view === "list" ? "grid gap-0 md:grid-cols-[260px_1fr]" : "flex h-full flex-col"
      }`}
    >
      <Link href={href} className={`relative block overflow-hidden bg-neutral-100 ${view === "list" ? "min-h-[230px]" : "aspect-[4/3]"}`}>
        <Image src={item.imagen} alt={item.nombre} fill sizes={view === "list" ? "260px" : "(max-width: 768px) 100vw, 33vw"} className="object-cover transition duration-700 group-hover:scale-105" />
        <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.12em] text-tecnova-red backdrop-blur">
          {item.categoria}
        </span>
      </Link>

      <div className="flex flex-1 flex-col p-3 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.16em] text-tecnova-red">
              {item.marca || "Tecnova"} {item.modelo ? `· ${item.modelo}` : ""}
            </p>
            <Link href={href} className="mt-2 block text-base font-black tracking-[-0.04em] transition hover:text-tecnova-red sm:text-2xl">
              {item.nombre}
            </Link>
          </div>
          <span className={`shrink-0 rounded-full px-3 py-1.5 text-[11px] font-black ${item.disponible ? "bg-emerald-50 text-emerald-700" : "bg-neutral-100 text-neutral-500"}`}>
            {item.disponible ? "Disponible" : "Consultar"}
          </span>
        </div>

        <p className="mt-3 flex-1 text-xs font-semibold leading-5 text-tecnova-steel sm:text-sm sm:leading-6">{item.descripcionCorta}</p>

        {view === "list" && item.caracteristicas.length > 0 && (
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {item.caracteristicas.slice(0, 4).map((feature) => (
              <p key={feature} className="rounded-2xl bg-neutral-50 px-3 py-2 text-xs font-bold text-neutral-700">
                {feature}
              </p>
            ))}
          </div>
        )}

        <div className="mt-5 flex flex-wrap items-center justify-between gap-2 sm:gap-3">
          <p className="text-sm font-black sm:text-lg">{formatPrice(item.precio, item.mostrarPrecio, item.etiquetaPrecio)}</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={addToCompare}
              className="grid h-11 w-11 place-items-center rounded-full border border-neutral-200 transition hover:border-tecnova-red hover:text-tecnova-red"
              aria-label="Agregar al comparador"
              title={compared ? "Agregado" : "Comparar"}
            >
              <GitCompare size={17} />
            </button>
            <button
              type="button"
              onClick={addToQuote}
              className="grid h-11 w-11 place-items-center rounded-full bg-black text-white transition hover:bg-tecnova-red"
              aria-label="Agregar a cotización"
              title={added ? "Agregado" : "Agregar a cotización"}
            >
              {added ? <Plus size={17} /> : <ShoppingCart size={17} />}
            </button>
          </div>
        </div>

        <Link href={href} className="mt-4 inline-flex items-center justify-center gap-2 rounded-2xl bg-tecnova-red px-4 py-3 text-sm font-black text-white transition hover:bg-red-700">
          Ver ficha <MessageCircle size={16} />
        </Link>
      </div>
    </article>
  );
}
