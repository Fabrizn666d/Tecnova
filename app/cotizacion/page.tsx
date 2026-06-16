import QuoteCart from "@/components/QuoteCart";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { getSettingsMap } from "@/lib/settings";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Carrito de cotización | Tecnova Perú",
  description: "Organiza productos y repuestos para enviar una cotización por WhatsApp.",
};

export default async function CotizacionPage() {
  const settings = await getSettingsMap();
  return (
    <main className="min-h-screen bg-white text-tecnova-dark">
      <SiteHeader whatsapp={settings.whatsapp} whatsappDisplay={settings.whatsapp_display} />
      <QuoteCart whatsapp={settings.whatsapp} />
      <SiteFooter settings={settings} />
    </main>
  );
}
