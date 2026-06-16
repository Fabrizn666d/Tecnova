import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { getSettingsMap } from "@/lib/settings";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Privacidad | Tecnova Perú",
};

export default async function Page() {
  return <LegalPage title="Política de Privacidad" text="Tecnova Perú protege la información enviada por formularios de contacto, cotización y libro de reclamaciones. Los datos se almacenan en la base de datos local del sistema para gestionar consultas, atención técnica y obligaciones legales." />;
}

async function LegalPage({ title, text }: { title: string; text: string }) {
  const settings = await getSettingsMap();
  return (
    <main className="min-h-screen bg-white text-tecnova-dark">
      <SiteHeader whatsapp={settings.whatsapp} whatsappDisplay={settings.whatsapp_display} />
      <section className="mx-auto max-w-[1000px] px-4 py-12 sm:px-5 lg:px-14">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-tecnova-red">Legal</p>
        <h1 className="mt-3 text-4xl font-black tracking-[-0.055em] sm:text-6xl">{title}</h1>
        <p className="mt-6 text-base font-semibold leading-8 text-tecnova-steel">{text}</p>
      </section>
      <SiteFooter settings={settings} />
    </main>
  );
}
