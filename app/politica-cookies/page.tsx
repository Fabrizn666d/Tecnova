import LegalDocument from "@/components/LegalDocument";
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
      <SiteHeader whatsapp={settings.whatsapp} whatsappDisplay={settings.whatsapp_display} logo={settings.logo_principal} />
      <LegalDocument
        title="Política de Cookies"
        intro="El sitio de Tecnova Perú usa almacenamiento técnico para que la experiencia de catálogo, comparador y cotización funcione correctamente."
        sections={[
          { title: "Uso técnico", body: ["Podemos usar almacenamiento local del navegador para recordar productos agregados al comparador o carrito de cotización.", "Este almacenamiento permite que el usuario conserve su selección mientras navega por maquinaria, repuestos y servicios."] },
          { title: "Servicios externos", body: ["Los enlaces a WhatsApp y Google Maps pueden abrir servicios de terceros con sus propias políticas.", "Tecnova puede incorporar medición o seguridad adicional en el futuro; cualquier cambio relevante deberá reflejarse en esta página."] },
          { title: "Control del usuario", body: ["El usuario puede borrar cookies y almacenamiento local desde la configuración de su navegador.", "Al hacerlo, podrían eliminarse productos guardados para cotización o comparación."] },
        ]}
      />
      <SiteFooter settings={settings} />
    </main>
  );
}
