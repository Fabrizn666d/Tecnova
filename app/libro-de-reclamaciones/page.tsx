import ComplaintForm from "@/components/ComplaintForm";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { getSettingsMap } from "@/lib/settings";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Libro de Reclamaciones | Tecnova Perú",
  description: "Formulario de Libro de Reclamaciones para consumidores en Perú.",
};

export default async function LibroPage() {
  const settings = await getSettingsMap();
  return (
    <main className="min-h-screen bg-white text-tecnova-dark">
      <SiteHeader whatsapp={settings.whatsapp} whatsappDisplay={settings.whatsapp_display} />
      <section className="mx-auto grid max-w-[1300px] gap-7 px-4 py-10 sm:px-5 lg:grid-cols-[0.8fr_1.2fr] lg:px-14">
        <div className="rounded-[30px] bg-black p-7 text-white shadow-lift sm:p-10">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-red-200">Legal Perú</p>
          <h1 className="mt-3 text-4xl font-black leading-none tracking-[-0.055em] sm:text-6xl">Libro de Reclamaciones</h1>
          <p className="mt-5 text-sm font-semibold leading-7 text-white/75">Registra reclamos o quejas sobre productos y servicios. La información queda guardada en la base de datos local y visible desde el panel administrativo.</p>
        </div>
        <ComplaintForm />
      </section>
      <SiteFooter settings={settings} />
    </main>
  );
}
