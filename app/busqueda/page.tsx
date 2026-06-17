import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { prisma } from "@/lib/prisma";
import { getSettingsMap } from "@/lib/settings";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Búsqueda | Tecnova Perú",
  description: "Busca productos, repuestos, servicios, categorías y marcas de Tecnova Perú.",
};

type SearchPayload = {
  productos: { id: string; nombre: string; slug: string; descripcionCorta?: string }[];
  repuestos: { id: string; nombre: string; slug: string; descripcionCorta?: string }[];
  categorias: { id: string; nombre: string; slug: string }[];
  servicios: { id: string; nombre: string; slug: string; descripcion?: string }[];
  marcas: { id: string; nombre: string }[];
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const q = (params.q || "").trim();
  const settings = await getSettingsMap();
  const payload = q.length >= 2 ? await getResults(q) : emptyResults();

  return (
    <main className="min-h-screen bg-white text-tecnova-dark">
      <SiteHeader whatsapp={settings.whatsapp} whatsappDisplay={settings.whatsapp_display} logo={settings.logo_principal} />
      <section className="mx-auto max-w-[1300px] px-4 py-10 sm:px-5 lg:px-14">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-tecnova-red">Búsqueda global</p>
        <h1 className="mt-3 text-4xl font-black leading-none tracking-[-0.055em] sm:text-6xl">{q ? `Resultados para "${q}"` : "Busca en Tecnova"}</h1>
        <p className="mt-4 text-sm font-semibold leading-7 text-tecnova-steel">Encuentra productos, repuestos, servicios, marcas y categorías desde un solo lugar.</p>
      </section>

      <section className="mx-auto grid max-w-[1300px] gap-5 px-4 pb-12 sm:px-5 lg:px-14">
        <ResultGroup title="Productos" items={payload.productos.map((item) => ({ title: item.nombre, text: item.descripcionCorta, href: `/productos/${item.slug}` }))} />
        <ResultGroup title="Repuestos" items={payload.repuestos.map((item) => ({ title: item.nombre, text: item.descripcionCorta, href: `/repuestos/${item.slug}` }))} />
        <ResultGroup title="Servicios" items={payload.servicios.map((item) => ({ title: item.nombre, text: item.descripcion, href: `/servicios/${item.slug}` }))} />
        <ResultGroup title="Categorías" items={payload.categorias.map((item) => ({ title: item.nombre, href: `/productos?categoria=${item.slug}` }))} />
        <ResultGroup title="Marcas" items={payload.marcas.map((item) => ({ title: item.nombre, href: `/productos?marca=${encodeURIComponent(item.nombre)}` }))} />
      </section>
      <SiteFooter settings={settings} />
    </main>
  );
}

async function getResults(q: string): Promise<SearchPayload> {
  try {
    const [productos, repuestos, categorias, servicios, marcas] = await Promise.all([
      prisma.product.findMany({
        where: { activo: true, tipo: "producto", OR: [{ nombre: { contains: q } }, { descripcionCorta: { contains: q } }, { marca: { contains: q } }, { modelo: { contains: q } }, { tags: { contains: q } }] },
        select: { id: true, nombre: true, slug: true, descripcionCorta: true },
        take: 12,
      }),
      prisma.product.findMany({
        where: { activo: true, tipo: "repuesto", OR: [{ nombre: { contains: q } }, { descripcionCorta: { contains: q } }, { marca: { contains: q } }, { modelo: { contains: q } }, { tags: { contains: q } }] },
        select: { id: true, nombre: true, slug: true, descripcionCorta: true },
        take: 12,
      }),
      prisma.category.findMany({ where: { activo: true, nombre: { contains: q } }, select: { id: true, nombre: true, slug: true }, take: 8 }),
      prisma.service.findMany({ where: { activo: true, nombre: { contains: q } }, select: { id: true, nombre: true, slug: true, descripcion: true }, take: 8 }),
      prisma.brand.findMany({ where: { activo: true, nombre: { contains: q } }, select: { id: true, nombre: true }, take: 8 }),
    ]);
    return { productos, repuestos, categorias, servicios, marcas };
  } catch {
    return emptyResults();
  }
}

function emptyResults(): SearchPayload {
  return { productos: [], repuestos: [], categorias: [], servicios: [], marcas: [] };
}

function ResultGroup({
  title,
  items,
}: {
  title: string;
  items: { title: string; text?: string | null; href: string }[];
}) {
  return (
    <div className="rounded-[24px] bg-white p-5 shadow-soft ring-1 ring-black/5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-2xl font-black">{title}</h2>
        <span className="text-sm font-black text-tecnova-red">{items.length}</span>
      </div>
      <div className="mt-4 grid gap-3">
        {items.length === 0 && <p className="rounded-lg bg-neutral-100 p-4 text-sm font-bold text-neutral-500">Sin resultados.</p>}
        {items.map((item) => (
          <Link key={`${title}-${item.href}`} href={item.href} className="rounded-lg border border-neutral-200 p-4 transition hover:border-tecnova-red">
            <p className="font-black">{item.title}</p>
            {item.text && <p className="mt-2 text-sm font-semibold leading-6 text-tecnova-steel">{item.text}</p>}
          </Link>
        ))}
      </div>
    </div>
  );
}
