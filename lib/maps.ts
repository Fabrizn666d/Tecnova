export function googleMapsEmbedSrc(settings: Record<string, string>) {
  const embed = extractIframeSrc(settings.google_maps_embed || "");
  if (embed) return embed;
  if (settings.google_maps_url) return settings.google_maps_url;
  return `https://www.google.com/maps?q=${encodeURIComponent(settings.direccion || "")}&output=embed`;
}

function extractIframeSrc(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  const match = trimmed.match(/\ssrc=["']([^"']+)["']/i);
  return match?.[1] || trimmed;
}
