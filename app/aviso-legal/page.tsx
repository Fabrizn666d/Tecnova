import LegalDocument from "@/components/LegalDocument";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { getSettingsMap } from "@/lib/settings";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Aviso Legal | Tecnova Perú",
};

export default async function Page() {
  const settings = await getSettingsMap();
  return (
    <main className="min-h-screen bg-white text-tecnova-dark">
      <SiteHeader whatsapp={settings.whatsapp} whatsappDisplay={settings.whatsapp_display} logo={settings.logo_principal} />
      <LegalDocument
        title="Aviso Legal"
        intro="Este sitio pertenece a Tecnova Perú y comunica información comercial sobre maquinaria industrial, repuestos, instalación, mantenimiento, reparación y servicios técnicos."
        sections={[
          { title: "Identificación", body: [`Nombre comercial: ${settings.empresa_nombre || "Tecnova Perú"}.`, `Razón social: ${settings.razon_social || "Por actualizar"}. RUC: ${settings.ruc || "Por actualizar"}.`, `Dirección: ${settings.direccion || "Por actualizar"}.`] },
          { title: "Contenido del sitio", body: ["La información técnica, fotografías, disponibilidad y precios pueden actualizarse desde el panel administrativo.", "El contenido no constituye una oferta definitiva hasta que Tecnova confirme cotización, condiciones técnicas, stock y alcance de servicio."] },
          { title: "Contacto", body: [`WhatsApp: ${settings.whatsapp_display || settings.whatsapp}.`, `Correo: ${settings.email || "Por actualizar"}.`, "Los canales publicados se usan para solicitudes comerciales, soporte, reclamos y coordinación de servicios."] },
        ]}
      />
      <SiteFooter settings={settings} />
    </main>
  );
}
