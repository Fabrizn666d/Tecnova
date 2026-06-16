import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { getSettingsMap } from "@/lib/settings";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Cookies | Tecnova Perú",
};

export default async function Page() {
  const settings = await getSettingsMap();
  return (
    <main className="min-h-screen bg-white text-tecnova-dark">
      <SiteHeader whatsapp={settings.whatsapp} whatsappDisplay={settings.whatsapp_display} />
      <section className="mx-auto max-w-[1000px] px-4 py-12 sm:px-5 lg:px-14">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-tecnova-red">Legal</p>
        <h1 className="mt-3 text-4xl font-black tracking-[-0.055em] sm:text-6xl">Política de Cookies</h1>
        <p className="mt-6 text-base font-semibold leading-8 text-tecnova-steel">El sitio puede utilizar almacenamiento local para mantener el carrito de cotización y el comparador en el navegador. No se usan servicios SaaS externos para este flujo.</p>
      </section>
      <SiteFooter settings={settings} />
    </main>
  );
}
