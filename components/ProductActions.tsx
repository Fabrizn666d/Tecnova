"use client";

import type { CatalogCard } from "@/lib/catalog-types";
import { addCompareItem, addQuoteItem } from "@/lib/quote-storage";
import { GitCompare, MessageCircle, ShoppingCart } from "lucide-react";
import { useState } from "react";

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

export default function ProductActions({
  item,
  whatsapp,
}: {
  item: CatalogCard;
  whatsapp: string;
}) {
  const [status, setStatus] = useState("");
  const message = `Hola Tecnova, quiero cotizar: ${item.nombre}${item.modelo ? ` (${item.modelo})` : ""}.`;

  function flash(text: string) {
    setStatus(text);
    window.setTimeout(() => setStatus(""), 1400);
  }

  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => {
            addQuoteItem(storagePayload(item));
            flash("Agregado a cotización");
          }}
          className="inline-flex h-[52px] items-center justify-center gap-2 rounded-2xl bg-black px-5 text-sm font-black text-white transition hover:bg-tecnova-red"
        >
          <ShoppingCart size={18} /> Agregar a cotización
        </button>
        <button
          type="button"
          onClick={() => {
            addCompareItem(storagePayload(item));
            flash("Agregado al comparador");
          }}
          className="inline-flex h-[52px] items-center justify-center gap-2 rounded-2xl border border-neutral-200 bg-white px-5 text-sm font-black transition hover:border-tecnova-red hover:text-tecnova-red"
        >
          <GitCompare size={18} /> Comparar
        </button>
      </div>
      <a
        href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(message)}`}
        target="_blank"
        rel="noreferrer"
        className="inline-flex h-[52px] w-full items-center justify-center gap-2 rounded-2xl bg-tecnova-red px-5 text-sm font-black text-white transition hover:bg-red-700"
      >
        <MessageCircle size={18} /> Cotizar por WhatsApp
      </a>
      {status && <p className="rounded-2xl bg-neutral-100 px-4 py-3 text-sm font-black text-neutral-700">{status}</p>}
    </div>
  );
}
