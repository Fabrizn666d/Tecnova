"use client";

import { formatPrice } from "@/lib/format";
import { clearCompareItems, readCompareItems, removeCompareItem, type StoredCatalogItem } from "@/lib/quote-storage";
import { MessageCircle, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";

export default function CompareTable({ whatsapp }: { whatsapp: string }) {
  const [items, setItems] = useState<StoredCatalogItem[]>([]);

  useEffect(() => {
    const timer = window.setTimeout(() => setItems(readCompareItems()), 0);
    return () => window.clearTimeout(timer);
  }, []);

  const message = useMemo(() => {
    const list = items.map((item, index) => `${index + 1}. ${item.nombre}${item.modelo ? ` - ${item.modelo}` : ""}`).join("\n");
    return `Hola Tecnova, quiero cotizar los productos comparados:\n\n${list}`;
  }, [items]);

  return (
    <section className="mx-auto max-w-[1300px] px-4 py-10 sm:px-5 lg:px-14">
      <div className="mb-7">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-tecnova-red">Comparador</p>
        <h1 className="mt-2 text-4xl font-black tracking-[-0.05em] sm:text-6xl">Compara hasta 4 ítems</h1>
      </div>

      {items.length === 0 ? (
        <div className="rounded-[28px] bg-white p-8 text-center shadow-soft ring-1 ring-black/5">
          <p className="text-2xl font-black">Agrega productos o repuestos al comparador.</p>
          <Link href="/productos" className="mt-5 inline-flex rounded-full bg-black px-5 py-3 text-sm font-black text-white">Explorar catálogo</Link>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-[28px] bg-white shadow-soft ring-1 ring-black/5">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="bg-neutral-50 text-xs uppercase tracking-[0.14em] text-neutral-500">
              <tr>
                <th className="p-4">Campo</th>
                {items.map((item) => (
                  <th key={item.id} className="p-4">{item.nombre}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              <CompareRow label="Imagen" items={items} render={(item) => (
                <div className="relative aspect-[4/3] w-40 overflow-hidden rounded-2xl bg-neutral-100">
                  <Image src={item.imagen || "/hero-tecnova-industrial.png"} alt={item.nombre} fill sizes="160px" className="object-cover" />
                </div>
              )} />
              <CompareRow label="Marca" items={items} render={(item) => item.marca || "Tecnova"} />
              <CompareRow label="Categoría" items={items} render={(item) => item.categoria || item.tipo} />
              <CompareRow label="Precio" items={items} render={(item) => formatPrice(item.precio, Boolean(item.precio))} />
              <CompareRow label="Disponibilidad" items={items} render={(item) => item.disponible ? "Disponible" : "Consultar"} />
              <tr>
                <td className="p-4 font-black">Acciones</td>
                {items.map((item) => (
                  <td key={item.id} className="p-4">
                    <button type="button" onClick={() => setItems(removeCompareItem(item.id))} className="inline-flex items-center gap-2 rounded-full bg-red-50 px-4 py-2 text-xs font-black text-tecnova-red">
                      <Trash2 size={14} /> Quitar
                    </button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
          <div className="flex flex-wrap gap-3 border-t border-neutral-100 p-5">
            <a href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(message)}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-tecnova-red px-5 py-3 text-sm font-black text-white">
              <MessageCircle size={17} /> Cotizar productos comparados
            </a>
            <button type="button" onClick={() => { clearCompareItems(); setItems([]); }} className="rounded-full border border-neutral-200 px-5 py-3 text-sm font-black">
              Limpiar comparador
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

function CompareRow({
  label,
  items,
  render,
}: {
  label: string;
  items: StoredCatalogItem[];
  render: (item: StoredCatalogItem) => ReactNode;
}) {
  return (
    <tr>
      <td className="p-4 font-black">{label}</td>
      {items.map((item) => (
        <td key={item.id} className="p-4 font-bold text-neutral-700">
          {render(item)}
        </td>
      ))}
    </tr>
  );
}
