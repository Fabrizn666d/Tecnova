import ComplaintForm from "@/components/ComplaintForm";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { getSettingsMap } from "@/lib/settings";
import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Libro de Reclamaciones | Tecnova Perú",
  description: "Formulario de Libro de Reclamaciones para consumidores en Perú.",
};

export default async function LibroPage() {
  const settings = await getSettingsMap();
  const mapSrc = settings.google_maps_embed || `https://www.google.com/maps?q=${encodeURIComponent(settings.direccion)}&output=embed`;
  return (
    <main className="min-h-screen bg-white text-tecnova-dark">
      <SiteHeader whatsapp={settings.whatsapp} whatsappDisplay={settings.whatsapp_display} logo={settings.logo_principal} />
      <section className="mx-auto grid max-w-[1300px] gap-7 px-4 py-10 sm:px-5 lg:grid-cols-[0.8fr_1.2fr] lg:px-14">
        <div className="space-y-5">
          <div className="rounded-lg bg-black p-7 text-white shadow-lift sm:p-10">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-red-200">Legal Perú</p>
            <h1 className="mt-3 text-4xl font-black leading-none tracking-[-0.055em] sm:text-6xl">Libro de Reclamaciones</h1>
            <p className="mt-5 text-sm font-semibold leading-7 text-white/75">Registra reclamos o quejas sobre productos, repuestos, cotizaciones y servicios técnicos. La información queda guardada en la base de datos y visible desde el panel administrativo.</p>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-lg border border-neutral-200 bg-neutral-100">
            {settings.libro_imagen ? (
              <Image src={settings.libro_imagen} alt="Libro de Reclamaciones Tecnova Perú" fill sizes="(max-width: 1024px) 100vw, 420px" className="object-contain" />
            ) : (
              <div className="grid h-full place-items-center p-8 text-center text-sm font-black text-neutral-500">
                Imagen del Libro de Reclamaciones
              </div>
            )}
          </div>
        </div>
        <ComplaintForm />
      </section>

      <section className="mx-auto max-w-[1300px] px-4 pb-12 sm:px-5 lg:px-14">
        <div className="overflow-hidden rounded-lg bg-neutral-100 shadow-soft ring-1 ring-black/5">
          <iframe
            src={mapSrc}
            title="Ubicación Tecnova Perú"
            className="h-[420px] w-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </section>
      <SiteFooter settings={settings} />
    </main>
  );
}
