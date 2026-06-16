"use client";

import { formatPrice } from "@/lib/format";
import {
  clearQuoteItems,
  readQuoteItems,
  removeQuoteItem,
  updateQuoteItemQuantity,
  type StoredQuoteItem,
} from "@/lib/quote-storage";
import { MessageCircle, Minus, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

export default function QuoteCart({ whatsapp }: { whatsapp: string }) {
  const [items, setItems] = useState<StoredQuoteItem[]>([]);

  useEffect(() => {
    const timer = window.setTimeout(() => setItems(readQuoteItems()), 0);
    return () => window.clearTimeout(timer);
  }, []);

  const message = useMemo(() => {
    const list = items.map((item, index) => `${index + 1}. ${item.nombre}${item.modelo ? ` - ${item.modelo}` : ""} x${item.cantidad}`).join("\n");
    return `Hola, deseo cotizar los siguientes productos:\n\n${list}\n\nQuedo atento a información y precios.`;
  }, [items]);

  function sync(next: StoredQuoteItem[]) {
    setItems(next);
  }

  return (
    <section className="mx-auto max-w-[1200px] px-4 py-10 sm:px-5 lg:px-14">
      <div className="mb-7">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-tecnova-red">Cotización</p>
        <h1 className="mt-2 text-4xl font-black tracking-[-0.05em] sm:text-6xl">Carrito de cotización</h1>
      </div>

      {items.length === 0 ? (
        <div className="rounded-[28px] bg-white p-8 text-center shadow-soft ring-1 ring-black/5">
          <p className="text-2xl font-black">Aún no agregaste productos ni repuestos.</p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <Link href="/productos" className="rounded-full bg-black px-5 py-3 text-sm font-black text-white">Ver productos</Link>
            <Link href="/repuestos" className="rounded-full bg-tecnova-red px-5 py-3 text-sm font-black text-white">Ver repuestos</Link>
          </div>
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
          <div className="grid gap-4">
            {items.map((item) => (
              <article key={item.id} className="grid gap-4 rounded-[24px] bg-white p-4 shadow-soft ring-1 ring-black/5 sm:grid-cols-[120px_1fr_auto] sm:items-center">
                <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-neutral-100">
                  <Image src={item.imagen || "/hero-tecnova-industrial.png"} alt={item.nombre} fill sizes="120px" className="object-cover" />
                </div>
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.14em] text-tecnova-red">{item.tipo}</p>
                  <h2 className="mt-1 text-xl font-black">{item.nombre}</h2>
                  <p className="mt-1 text-sm font-bold text-tecnova-steel">{item.marca || "Tecnova"} {item.modelo || ""}</p>
                  <p className="mt-2 text-sm font-black">{formatPrice(item.precio, Boolean(item.precio))}</p>
                </div>
                <div className="flex items-center gap-2 sm:justify-end">
                  <button type="button" onClick={() => sync(updateQuoteItemQuantity(item.id, item.cantidad - 1))} className="grid h-10 w-10 place-items-center rounded-full border border-neutral-200" aria-label="Restar">
                    <Minus size={15} />
                  </button>
                  <span className="grid h-10 min-w-10 place-items-center rounded-full bg-neutral-100 px-3 text-sm font-black">{item.cantidad}</span>
                  <button type="button" onClick={() => sync(updateQuoteItemQuantity(item.id, item.cantidad + 1))} className="grid h-10 w-10 place-items-center rounded-full border border-neutral-200" aria-label="Sumar">
                    <Plus size={15} />
                  </button>
                  <button type="button" onClick={() => sync(removeQuoteItem(item.id))} className="grid h-10 w-10 place-items-center rounded-full bg-red-50 text-tecnova-red" aria-label="Eliminar">
                    <Trash2 size={16} />
                  </button>
                </div>
              </article>
            ))}
          </div>

          <aside className="rounded-[28px] bg-black p-6 text-white shadow-lift lg:sticky lg:top-24 lg:self-start">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-red-200">Resumen</p>
            <p className="mt-3 text-3xl font-black">{items.length} ítems</p>
            <p className="mt-3 text-sm font-semibold leading-6 text-white/70">Se generará un mensaje automático para WhatsApp con el detalle de productos y repuestos.</p>
            <a href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(message)}`} target="_blank" rel="noreferrer" className="mt-6 inline-flex h-[52px] w-full items-center justify-center gap-2 rounded-2xl bg-tecnova-red px-5 text-sm font-black text-white">
              <MessageCircle size={18} /> Enviar cotización por WhatsApp
            </a>
            <button type="button" onClick={() => { clearQuoteItems(); setItems([]); }} className="mt-3 h-12 w-full rounded-2xl border border-white/15 text-sm font-black text-white/85">
              Vaciar carrito
            </button>
          </aside>
        </div>
      )}
    </section>
  );
}
