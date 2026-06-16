import LegalDocument from "@/components/LegalDocument";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { getSettingsMap } from "@/lib/settings";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Términos y Condiciones | Tecnova Perú",
};

export default async function Page() {
  const settings = await getSettingsMap();
  return (
    <main className="min-h-screen bg-white text-tecnova-dark">
      <SiteHeader whatsapp={settings.whatsapp} whatsappDisplay={settings.whatsapp_display} logo={settings.logo_principal} />
      <LegalDocument
        title="Términos y Condiciones"
        intro="El uso del sitio implica aceptar que la información publicada sirve como referencia comercial para solicitar maquinaria, repuestos, servicios técnicos y cotizaciones."
        sections={[
          { title: "Cotizaciones", body: ["Las cotizaciones solicitadas por formularios o WhatsApp son referenciales hasta validar disponibilidad, estado del equipo, alcance técnico, lugar de entrega, instalación y forma de pago.", "Tecnova puede solicitar información adicional para definir compatibilidad de repuestos, potencia, modelo, medidas, tensión eléctrica o condiciones de operación."] },
          { title: "Productos, repuestos y servicios", body: ["Las imágenes, marcas, modelos y especificaciones pueden variar según stock, proveedor o requerimiento del cliente.", "Los servicios técnicos como instalación, reparación, mantenimiento y automatización se programan según evaluación, agenda y condiciones de acceso al equipo."] },
          { title: "Responsabilidad del usuario", body: ["El usuario declara que la información enviada para cotización o reclamación es veraz y suficiente para ser contactado.", "Tecnova no se responsabiliza por errores derivados de datos incompletos, modelos incorrectos o condiciones técnicas no informadas."] },
        ]}
      />
      <SiteFooter settings={settings} />
    </main>
  );
}
