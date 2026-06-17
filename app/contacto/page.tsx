import ContactForm from "@/components/ContactForm";
import GoogleMapSection from "@/components/GoogleMapSection";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { getSettingsMap } from "@/lib/settings";
import { Mail, MapPin, MessageCircle } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contacto | Tecnova Peru",
  description: "Solicita cotizacion de maquinaria, repuestos o servicio tecnico industrial.",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ContactoPage() {
  const settings = await getSettingsMap();
  return (
    <main className="min-h-screen bg-white text-tecnova-dark">
      <SiteHeader whatsapp={settings.whatsapp} whatsappDisplay={settings.whatsapp_display} logo={settings.logo_principal} />
      <section className="mx-auto grid max-w-[1300px] gap-7 px-4 py-10 sm:px-5 lg:grid-cols-[0.8fr_1.2fr] lg:px-14">
        <div className="rounded-[30px] bg-black p-7 text-white shadow-lift sm:p-10">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-red-200">Contacto</p>
          <h1 className="mt-3 text-4xl font-black leading-none tracking-[-0.055em] sm:text-6xl">Cotiza con soporte tecnico</h1>
          <div className="mt-7 space-y-4 text-sm font-bold text-white/82">
            <p className="flex items-center gap-3"><MessageCircle size={18} />{settings.whatsapp_display}</p>
            <p className="flex items-center gap-3 break-all"><Mail size={18} />{settings.email}</p>
            <p className="flex items-center gap-3"><MapPin size={18} />{settings.direccion}</p>
          </div>
        </div>
        <ContactForm />
      </section>
      <GoogleMapSection settings={settings} />
      <SiteFooter settings={settings} />
    </main>
  );
}
