"use client";

import { STORAGE_EVENT, readQuoteItems } from "@/lib/quote-storage";
import { GitCompare, Menu, Search, ShoppingCart, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

type Suggestion = {
  nombre: string;
  tipo: string;
  href: string;
};

export default function SiteHeader({
  whatsapp,
  whatsappDisplay,
  logo = "/logo.png",
}: {
  whatsapp: string;
  whatsappDisplay: string;
  logo?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [quoteCount, setQuoteCount] = useState(0);
  const [logoSrc, setLogoSrc] = useState(logo || "/logo.png");
  const cleanWhatsapp = (whatsapp || "").replace(/\D/g, "");
  const visibleWhatsapp = whatsappDisplay?.trim();

  useEffect(() => {
    const sync = () => setQuoteCount(readQuoteItems().reduce((total, item) => total + item.cantidad, 0));
    sync();
    window.addEventListener(STORAGE_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(STORAGE_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) return;

    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      fetch(`/api/busqueda/sugerencias?q=${encodeURIComponent(trimmed)}`, { signal: controller.signal })
        .then((response) => response.json())
        .then((payload) => setSuggestions(payload.data || []))
        .catch(() => null);
    }, 180);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = query.trim();
    if (trimmed) router.push(`/busqueda?q=${encodeURIComponent(trimmed)}`);
  }

  const nav = [
    ["Inicio", "/"],
    ["Productos", "/productos"],
    ["Repuestos", "/repuestos"],
    ["Servicios", "/servicios"],
    ["Trabajos", "/trabajos-realizados"],
    ["Nosotros", "/nosotros"],
    ["Contacto", "/contacto"],
  ] as const;

  return (
    <header className="sticky top-0 z-50 border-b border-neutral-100 bg-white/95 backdrop-blur-2xl">
      <nav className="mx-auto flex max-w-[1540px] items-center justify-between gap-3 px-4 py-3 sm:px-5 lg:px-14">
        <Link href="/" className="relative h-12 w-[150px] shrink-0 lg:h-14 lg:w-[196px]">
          <Image src={logoSrc} alt="Tecnova Perú" fill sizes="196px" className="object-contain object-left" onError={() => setLogoSrc("/logo.png")} />
        </Link>

        <div className="hidden items-center gap-6 text-sm font-black text-neutral-700 xl:flex">
          {nav.map(([label, href]) => (
            <Link key={href} href={href} className="transition hover:text-tecnova-red">
              {label}
            </Link>
          ))}
        </div>

        <form onSubmit={submitSearch} className="relative hidden h-11 w-[330px] items-center rounded-full border border-neutral-100 bg-neutral-50 px-4 lg:flex">
          <input
            value={query}
            onChange={(event) => {
              const value = event.target.value;
              setQuery(value);
              if (value.trim().length < 2) setSuggestions([]);
            }}
            placeholder="Buscar equipos, repuestos, marcas..."
            className="min-w-0 flex-1 bg-transparent text-xs font-bold outline-none placeholder:text-neutral-400"
          />
          <button className="grid h-8 w-8 place-items-center rounded-full text-neutral-700 hover:text-tecnova-red" aria-label="Buscar">
            <Search size={17} />
          </button>
          {suggestions.length > 0 && (
            <div className="absolute left-0 right-0 top-12 overflow-hidden rounded-2xl bg-white shadow-lift ring-1 ring-black/5">
              {suggestions.slice(0, 7).map((item) => (
                <Link
                  key={`${item.tipo}-${item.href}-${item.nombre}`}
                  href={item.href}
                  onClick={() => {
                    setQuery("");
                    setSuggestions([]);
                  }}
                  className="flex items-center justify-between px-4 py-3 text-sm font-bold hover:bg-neutral-50"
                >
                  <span>{item.nombre}</span>
                  <span className="text-[10px] uppercase tracking-[0.14em] text-tecnova-red">{item.tipo}</span>
                </Link>
              ))}
            </div>
          )}
        </form>

        <div className="flex items-center gap-2">
          <Link href="/comparador" className="grid h-10 w-10 place-items-center rounded-full border border-neutral-200 transition hover:border-tecnova-red hover:text-tecnova-red" aria-label="Comparador">
            <GitCompare size={17} />
          </Link>
          <Link href="/cotizacion" className="relative grid h-10 w-10 place-items-center rounded-full bg-black text-white transition hover:bg-tecnova-red" aria-label="Carrito de cotización">
            <ShoppingCart size={17} />
            {quoteCount > 0 && (
              <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-tecnova-red px-1 text-[10px] font-black">
                {quoteCount}
              </span>
            )}
          </Link>
          {cleanWhatsapp && visibleWhatsapp && (
            <a
              href={`https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent("Hola Tecnova, quiero solicitar una cotización.")}`}
              target="_blank"
              rel="noreferrer"
              className="hidden rounded-full bg-tecnova-red px-5 py-2.5 text-sm font-black text-white transition hover:bg-red-700 sm:inline-flex"
            >
              {visibleWhatsapp}
            </a>
          )}
          <button type="button" onClick={() => setOpen((value) => !value)} className="grid h-10 w-10 place-items-center rounded-full border border-neutral-200 xl:hidden" aria-label="Abrir menu" aria-expanded={open}>
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </nav>

      {open && (
        <div className="mx-auto max-w-[1540px] px-4 pb-4 sm:px-5 xl:hidden">
          <div className="rounded-[24px] bg-white p-4 shadow-soft ring-1 ring-black/5">
            <form onSubmit={submitSearch} className="mb-3 flex h-11 items-center rounded-full border border-neutral-100 bg-neutral-50 px-4">
              <input
                value={query}
                onChange={(event) => {
                  const value = event.target.value;
                  setQuery(value);
                  if (value.trim().length < 2) setSuggestions([]);
                }}
                placeholder="Buscar..."
                className="min-w-0 flex-1 bg-transparent text-xs font-bold outline-none"
              />
              <button className="grid h-8 w-8 place-items-center" aria-label="Buscar">
                <Search size={17} />
              </button>
            </form>
            <div className="grid gap-1">
              {nav.map(([label, href]) => (
                <Link key={href} href={href} onClick={() => setOpen(false)} className="rounded-2xl px-4 py-3 text-sm font-black text-neutral-700 hover:bg-neutral-100">
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
