import LegalDocument from "@/components/LegalDocument";
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
      <SiteHeader whatsapp={settings.whatsapp} whatsappDisplay={settings.whatsapp_display} logo={settings.logo_principal} />
      <LegalDocument
        title="Cambios y Devoluciones"
        intro="Los cambios, garantías o devoluciones se evalúan según la naturaleza del equipo, repuesto o servicio técnico contratado."
        sections={[
          { title: "Evaluación previa", body: ["Antes de aprobar un cambio o devolución, Tecnova puede revisar estado físico, compatibilidad, instalación, uso, embalaje, comprobantes y condiciones pactadas en la cotización.", "En repuestos eléctricos, electrónicos o de instalación técnica, puede requerirse diagnóstico para verificar manipulación, montaje o daño por uso."] },
          { title: "Productos y repuestos", body: ["Todo cambio está sujeto a stock, validación de modelo, referencia, medidas, voltaje y compatibilidad.", "Los pedidos especiales, importaciones, repuestos instalados o piezas usadas pueden tener condiciones particulares acordadas con el cliente."] },
          { title: "Servicios técnicos", body: ["Los servicios de instalación, mantenimiento, reparación o automatización se documentan según alcance aprobado.", "Cualquier observación debe comunicarse por los canales oficiales para coordinar revisión técnica y respuesta."] },
        ]}
      />
      <SiteFooter settings={settings} />
    </main>
  );
}
