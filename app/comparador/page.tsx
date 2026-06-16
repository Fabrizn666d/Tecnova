import CompareTable from "@/components/CompareTable";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { getSettingsMap } from "@/lib/settings";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Comparador | Tecnova Perú",
  description: "Compara hasta cuatro productos o repuestos antes de solicitar cotización.",
};

export default async function ComparadorPage() {
  const settings = await getSettingsMap();
  return (
    <main className="min-h-screen bg-white text-tecnova-dark">
      <SiteHeader whatsapp={settings.whatsapp} whatsappDisplay={settings.whatsapp_display} />
      <CompareTable whatsapp={settings.whatsapp} />
      <SiteFooter settings={settings} />
    </main>
  );
}
