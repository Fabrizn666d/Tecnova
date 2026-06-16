"use client";

import { formatPrice } from "@/lib/format";
import {
  clearQuoteItems,
  readQuoteItems,
  removeQuoteItem,
  updateQuoteItemQuantity,
  type StoredQuoteItem,
} from "@/lib/quote-storage";
import { CheckCircle2, MessageCircle, Minus, Plus, Send, Trash2, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";

export default function QuoteCart({ whatsapp }: { whatsapp: string }) {
  const [items, setItems] = useState<StoredQuoteItem[]>([]);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setItems(readQuoteItems()), 0);
    return () => window.clearTimeout(timer);
  }, []);

  const message = useMemo(() => {
    const list = items
      .map((item, index) => `${index + 1}. ${item.nombre}${item.modelo ? ` - ${item.modelo}` : ""} x${item.cantidad}`)
      .join("\n");
    return `Hola, deseo cotizar los siguientes productos:\n\n${list}\n\nQuedo atento a información y precios.`;
  }, [items]);

  const whatsappUrl = `https://wa.me/${whatsapp}?text=${encodeURIComponent(message)}`;

  function sync(next: StoredQuoteItem[]) {
    setItems(next);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (items.length === 0) return;

    const form = new FormData(event.currentTarget);
    setStatus("");
    setLoading(true);
    try {
      const response = await fetch("/api/cotizaciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: form.get("nombre"),
          telefono: form.get("telefono"),
          email: form.get("email"),
          mensaje: `${form.get("mensaje") || ""}\n\n${message}`.trim(),
          fuente: "web",
          items: items.map((item) => ({ productId: item.id, cantidad: item.cantidad })),
        }),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok || !payload?.ok) {
        setStatus(payload?.message || "No se pudo registrar la cotización. Intenta nuevamente.");
        return;
      }
      clearQuoteItems();
      setItems([]);
      setShowSuccess(true);
      event.currentTarget.reset();
    } catch {
      setStatus("No se pudo conectar con el servidor. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mx-auto max-w-[1200px] px-4 py-10 sm:px-5 lg:px-14">
      <div className="mb-7">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-tecnova-red">Cotización</p>
        <h1 className="mt-2 text-4xl font-black tracking-[-0.05em] sm:text-6xl">Carrito de cotización</h1>
      </div>

      {items.length === 0 && !showSuccess ? (
        <div className="rounded-[28px] bg-white p-8 text-center shadow-soft ring-1 ring-black/5">
          <p className="text-2xl font-black">Aún no agregaste productos ni repuestos.</p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <Link href="/productos" className="rounded-full bg-black px-5 py-3 text-sm font-black text-white">Ver productos</Link>
            <Link href="/repuestos" className="rounded-full bg-tecnova-red px-5 py-3 text-sm font-black text-white">Ver repuestos</Link>
          </div>
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-[1fr_380px]">
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
            <p className="text-xs font-black uppercase tracking-[0.16em] text-red-200">Datos de contacto</p>
            <p className="mt-3 text-3xl font-black">{items.length} ítems</p>
            <p className="mt-3 text-sm font-semibold leading-6 text-white/70">Registraremos tu solicitud y luego podrás continuar por WhatsApp.</p>
            <form onSubmit={submit} className="mt-5 space-y-3">
              <input name="nombre" required placeholder="Nombre" className="h-12 w-full rounded-2xl border border-white/10 bg-white/10 px-4 text-sm font-bold text-white placeholder:text-white/45 outline-none focus:border-white/40" />
              <input name="telefono" required placeholder="Teléfono o WhatsApp" className="h-12 w-full rounded-2xl border border-white/10 bg-white/10 px-4 text-sm font-bold text-white placeholder:text-white/45 outline-none focus:border-white/40" />
              <input name="email" type="email" placeholder="Correo opcional" className="h-12 w-full rounded-2xl border border-white/10 bg-white/10 px-4 text-sm font-bold text-white placeholder:text-white/45 outline-none focus:border-white/40" />
              <textarea name="mensaje" placeholder="Mensaje adicional" className="min-h-24 w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-bold text-white placeholder:text-white/45 outline-none focus:border-white/40" />
              {status && <p className="rounded-2xl bg-red-500/15 p-3 text-sm font-bold text-red-100">{status}</p>}
              <button disabled={loading || items.length === 0} className="inline-flex h-[52px] w-full items-center justify-center gap-2 rounded-2xl bg-tecnova-red px-5 text-sm font-black text-white transition hover:bg-red-700 disabled:opacity-60">
                <Send size={18} /> {loading ? "Enviando..." : "Enviar solicitud"}
              </button>
            </form>
            <button type="button" onClick={() => { clearQuoteItems(); setItems([]); }} className="mt-3 h-12 w-full rounded-2xl border border-white/15 text-sm font-black text-white/85">
              Vaciar carrito
            </button>
          </aside>
        </div>
      )}

      {showSuccess && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 px-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-[28px] bg-white p-7 shadow-lift">
            <button type="button" onClick={() => setShowSuccess(false)} className="ml-auto grid h-10 w-10 place-items-center rounded-full bg-neutral-100" aria-label="Cerrar">
              <X size={18} />
            </button>
            <CheckCircle2 className="h-14 w-14 text-emerald-600" />
            <h2 className="mt-5 text-3xl font-black tracking-[-0.04em]">Gracias por tu solicitud.</h2>
            <p className="mt-4 text-sm font-semibold leading-7 text-tecnova-steel">
              Hemos recibido correctamente tu cotización. Nuestro equipo revisará tu requerimiento y se pondrá en contacto contigo a la brevedad.
            </p>
            <p className="mt-3 text-sm font-semibold leading-7 text-tecnova-steel">También puedes escribirnos directamente por WhatsApp.</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <a href={whatsappUrl} target="_blank" rel="noreferrer" className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 text-sm font-black text-white">
                <MessageCircle size={18} /> Ir a WhatsApp
              </a>
              <Link href="/productos" className="inline-flex h-12 items-center justify-center rounded-2xl border border-neutral-200 px-5 text-sm font-black">
                Continuar navegando
              </Link>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
