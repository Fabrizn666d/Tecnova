import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { getSettingsMap } from "@/lib/settings";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cambios y Devoluciones | Tecnova Perú",
};

export default async function Page() {
  const settings = await getSettingsMap();
  return (
    <main className="min-h-screen bg-white text-tecnova-dark">
      <SiteHeader whatsapp={settings.whatsapp} whatsappDisplay={settings.whatsapp_display} />
      <section className="mx-auto max-w-[1000px] px-4 py-12 sm:px-5 lg:px-14">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-tecnova-red">Legal</p>
        <h1 className="mt-3 text-4xl font-black tracking-[-0.055em] sm:text-6xl">Cambios y Devoluciones</h1>
        <p className="mt-6 text-base font-semibold leading-8 text-tecnova-steel">Los cambios, garantías o devoluciones se evalúan según la naturaleza del equipo o repuesto, su estado, instalación realizada y acuerdo comercial confirmado con Tecnova Perú.</p>
      </section>
      <SiteFooter settings={settings} />
    </main>
  );
}
