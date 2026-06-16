export function generarLinkWhatsApp(params: {
  numero: string;
  producto?: string;
  modelo?: string | null;
  referencia?: string | null;
  mensajeCustom?: string | null;
}) {
  const mensaje = params.mensajeCustom
    ? params.mensajeCustom
    : params.producto
      ? `Hola Tecnova, me interesa el producto: ${params.producto}${params.modelo ? ` (Modelo: ${params.modelo})` : ""}${params.referencia ? ` / Ref: ${params.referencia}` : ""}. ¿Podrían darme más información y precio?`
      : "Hola Tecnova, me gustaría recibir más información sobre sus equipos y servicios.";

  return `https://wa.me/${params.numero}?text=${encodeURIComponent(mensaje)}`;
}

export const DEFAULT_WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP || "51937492227";
