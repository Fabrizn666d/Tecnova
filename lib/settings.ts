import { prisma } from "@/lib/prisma";

const fallbackSettings = {
  empresa_nombre: "Tecnova Perú",
  razon_social: "Tecnova Perú",
  ruc: "Por actualizar",
  telefono: "937 492 227",
  whatsapp: "51937492227",
  whatsapp_display: "937 492 227",
  email: "jose.ylver.martinez18@gmail.com",
  direccion: "San Juan de Lurigancho, Lima, Perú",
  horario: "Lunes a sábado de 8:00 a.m. a 6:00 p.m.",
  google_maps_url: "",
  google_maps_embed: "",
  logo_principal: "/logo.png",
  logo_footer: "/logo.png",
  favicon: "/favicon.ico",
  libro_imagen: "",
  facebook_url: "",
  instagram_url: "",
  tiktok_url: "",
  linkedin_url: "",
  seo_titulo: "Tecnova Perú | Maquinaria industrial",
  seo_descripcion: "Venta de maquinaria, repuestos y servicios técnicos para panificación e industria alimentaria.",
  copyright_texto: "© 2026 Tecnova Perú. Todos los derechos reservados.",
  designer_texto: "Diseñado y desarrollado por Fabrizio Apaza",
  mensaje_whatsapp: "Hola Tecnova, me gustaría recibir más información sobre sus equipos y servicios.",
};

export async function getSettingsMap() {
  try {
    const rows = await prisma.setting.findMany();
    return {
      ...fallbackSettings,
      ...Object.fromEntries(rows.map((row) => [row.clave, row.valor])),
    };
  } catch {
    return fallbackSettings;
  }
}
