import { prisma } from "@/lib/prisma";

const fallbackSettings = {
  empresa_nombre: "Tecnova Perú",
  razon_social: "Tecnova Perú",
  ruc: "Por actualizar",
  whatsapp: "51937492227",
  whatsapp_display: "937 492 227",
  email: "jose.ylver.martinez18@gmail.com",
  direccion: "San Juan de Lurigancho, Lima, Perú",
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
