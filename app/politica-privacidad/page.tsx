import LegalDocument from "@/components/LegalDocument";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { getSettingsMap } from "@/lib/settings";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Privacidad | Tecnova Perú",
};

export default async function Page() {
  const settings = await getSettingsMap();
  return (
    <main className="min-h-screen bg-white text-tecnova-dark">
      <SiteHeader whatsapp={settings.whatsapp} whatsappDisplay={settings.whatsapp_display} logo={settings.logo_principal} />
      <LegalDocument
        title="Política de Privacidad"
        intro="Tecnova Perú trata la información de clientes y visitantes únicamente para responder consultas, preparar cotizaciones, coordinar ventas, repuestos, servicios técnicos y atender solicitudes legales."
        sections={[
          { title: "Datos que recopilamos", body: ["Podemos recibir nombres, documento, teléfono, correo, dirección, detalle de equipos, productos o servicios solicitados, mensajes enviados por formularios, WhatsApp y Libro de Reclamaciones.", "También podemos registrar datos administrativos necesarios para dar seguimiento a cotizaciones, leads, reclamos o quejas dentro del panel de Tecnova."] },
          { title: "Finalidad", body: ["Usamos los datos para responder solicitudes comerciales, enviar cotizaciones, coordinar instalación, mantenimiento, reparación, venta de maquinaria y repuestos, y cumplir obligaciones de atención al consumidor.", "No vendemos bases de datos ni usamos la información para fines ajenos a la relación comercial o de soporte solicitada por el usuario."] },
          { title: "Conservación y seguridad", body: ["La información se almacena en la infraestructura del sitio y en la base de datos administrada por Tecnova. Se restringe el acceso al panel administrativo mediante usuarios autorizados.", "El usuario puede solicitar actualización o eliminación de sus datos cuando corresponda escribiendo a los canales de contacto publicados."] },
        ]}
      />
      <SiteFooter settings={settings} />
    </main>
  );
}
