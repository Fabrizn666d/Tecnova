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
  nosotros_titulo: "Experiencia técnica para producción industrial",
  nosotros_subtitulo: "Tecnova Perú acompaña a empresas que necesitan equipos confiables, repuestos compatibles y soporte técnico rápido.",
  nosotros_historia:
    "Atendemos panaderías, restaurantes e industria alimentaria con venta de maquinaria, repuestos, instalación, mantenimiento y automatización. Nuestra operación está preparada para trabajar con datos, archivos y administración local en VPS.",
  nosotros_mision:
    "Ayudar a que cada cliente mantenga su operación activa con soluciones técnicas claras, repuestos adecuados y acompañamiento responsable.",
  nosotros_vision:
    "Ser un referente peruano en maquinaria, repuestos y servicio técnico para producción alimentaria e industrial.",
  nosotros_valores: "Responsabilidad\nClaridad técnica\nRespuesta rápida\nTrabajo honesto",
  nosotros_imagen: "/hero-tecnova-industrial.png",
  nosotros_stat_1_label: "Equipos y repuestos",
  nosotros_stat_1_value: "",
  nosotros_stat_2_label: "Trabajos publicados",
  nosotros_stat_2_value: "",
  nosotros_stat_3_label: "Marcas trabajadas",
  nosotros_stat_3_value: "",
  facebook_url: "",
  instagram_url: "",
  tiktok_url: "",
  youtube_url: "",
  linkedin_url: "",
  seo_titulo: "Tecnova Perú | Maquinaria industrial",
  seo_descripcion:
    "Venta de maquinaria, repuestos y servicios técnicos para panificación e industria alimentaria.",
  copyright_texto: "© 2026 Tecnova Perú. Todos los derechos reservados.",
  designer_texto: "Designed and developed by Fabrizio Apaza",
  footer_descripcion:
    "Maquinaria industrial, repuestos y servicio técnico para panificación, producción alimentaria y automatización.",
  legal_libro_label: "Libro de Reclamaciones",
  legal_libro_url: "/libro-de-reclamaciones",
  legal_privacidad_label: "Política de Privacidad",
  legal_privacidad_url: "/politica-privacidad",
  legal_cookies_label: "Política de Cookies",
  legal_cookies_url: "/politica-cookies",
  legal_terminos_label: "Términos y Condiciones",
  legal_terminos_url: "/terminos-y-condiciones",
  legal_aviso_label: "Aviso Legal",
  legal_aviso_url: "/aviso-legal",
  legal_cambios_label: "Cambios y Devoluciones",
  legal_cambios_url: "/cambios-y-devoluciones",
  mensaje_whatsapp:
    "Hola Tecnova, me gustaría recibir más información sobre sus equipos y servicios.",
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
