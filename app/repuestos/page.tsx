import CatalogBrowser from "@/components/CatalogBrowser";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { getCatalogFilters, getCatalogItems, toCatalogCard } from "@/lib/catalog";
import { getSettingsMap } from "@/lib/settings";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Repuestos industriales | Tecnova Perú",
  description: "Catálogo independiente de motores, tableros, controladores, sensores, resistencias y repuestos industriales.",
  openGraph: {
    title: "Repuestos industriales | Tecnova Perú",
    description: "Repuestos para hornos, laminadoras, quemadores y equipos industriales.",
  },
};

export default async function RepuestosPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; categoria?: string; marca?: string }>;
}) {
  const params = await searchParams;
  const [settings, items, filters] = await Promise.all([
    getSettingsMap(),
    getCatalogItems("repuesto"),
    getCatalogFilters("repuesto"),
  ]);

  return (
    <main className="min-h-screen bg-white text-tecnova-dark">
      <SiteHeader whatsapp={settings.whatsapp} whatsappDisplay={settings.whatsapp_display} />
      <section className="bg-neutral-100 px-4 py-10 sm:px-5 lg:px-14">
        <div className="mx-auto max-w-[1540px]">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-tecnova-red">Catálogo de repuestos</p>
          <h1 className="mt-3 max-w-4xl text-4xl font-black leading-none tracking-[-0.055em] sm:text-6xl">Componentes críticos para mantener tu operación activa</h1>
          <p className="mt-5 max-w-2xl text-base font-semibold leading-7 text-tecnova-steel">
            Motores, motorreductores, tableros, controladores, sensores, resistencias, termostatos, variadores y tarjetas electrónicas.
          </p>
        </div>
      </section>
      <CatalogBrowser
        kind="repuesto"
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
