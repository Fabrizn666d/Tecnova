import CatalogBrowser from "@/components/CatalogBrowser";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { getCatalogFilters, getCatalogItems, toCatalogCard } from "@/lib/catalog";
import { getSettingsMap } from "@/lib/settings";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Productos industriales | Tecnova Perú",
  description: "Catálogo de hornos, laminadoras, batidoras, cortadoras, quemadores y equipos industriales.",
  openGraph: {
    title: "Productos industriales | Tecnova Perú",
    description: "Equipos industriales para panificación, producción alimentaria y automatización.",
  },
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ProductosPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; categoria?: string; marca?: string }>;
}) {
  const params = await searchParams;
  const [settings, items, filters] = await Promise.all([
    getSettingsMap(),
    getCatalogItems("producto"),
    getCatalogFilters("producto"),
  ]);

  return (
    <main className="min-h-screen bg-white text-tecnova-dark">
      <SiteHeader whatsapp={settings.whatsapp} whatsappDisplay={settings.whatsapp_display} logo={settings.logo_principal} />
      <CatalogHero
        eyebrow="Catálogo de productos"
        title="Equipos industriales para producción"
        text="Busca, filtra y compara hornos, laminadoras, quemadores y maquinaria para operación diaria."
      />
      <CatalogBrowser
        kind="producto"
        items={items.map(toCatalogCard)}
        categories={filters.categories}
        brands={filters.brands}
        initialQuery={params.q || ""}
        initialCategory={params.categoria || "todos"}
        initialBrand={params.marca || "todos"}
      />
      <SiteFooter settings={settings} />
    </main>
  );
}

function CatalogHero({ eyebrow, title, text }: { eyebrow: string; title: string; text: string }) {
  return (
    <section className="bg-neutral-100 px-4 py-10 sm:px-5 lg:px-14">
      <div className="mx-auto max-w-[1540px]">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-tecnova-red">{eyebrow}</p>
        <h1 className="mt-3 max-w-4xl text-4xl font-black leading-none tracking-[-0.055em] sm:text-6xl">{title}</h1>
        <p className="mt-5 max-w-2xl text-base font-semibold leading-7 text-tecnova-steel">{text}</p>
      </div>
    </section>
  );
}
