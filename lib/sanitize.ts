export function cleanText(value: unknown, max = 500) {
  if (typeof value !== "string") return "";
  return value.replace(/[<>]/g, "").replace(/\s+/g, " ").trim().slice(0, max);
}

export function cleanOptionalText(value: unknown, max = 500) {
  const cleaned = cleanText(value, max);
  return cleaned.length ? cleaned : null;
}

export function cleanSlug(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function safeJson(value: unknown, fallback = "[]") {
  if (typeof value === "string") {
    try {
      JSON.parse(value);
      return value;
    } catch {
      return fallback;
    }
  }
  return JSON.stringify(value ?? JSON.parse(fallback));
}

export function cleanPublicAssetPath(value: unknown, max = 500) {
  const cleaned = cleanText(value, max);
  if (!cleaned) return null;
  if (/^(blob:|data:|file:)/i.test(cleaned)) return null;
  if (/^[a-zA-Z]:[\\/]/.test(cleaned)) return null;
  if (cleaned.startsWith("/root/") || cleaned.startsWith("/home/") || cleaned.startsWith("/tmp/")) return null;
  if (cleaned.startsWith("/uploads/")) return cleaned;
  if (cleaned.startsWith("/products/")) return cleaned;
  if (["/logo.png", "/favicon.ico", "/hero-tecnova-industrial.png", "/tecnova-loader.png"].includes(cleaned)) return cleaned;
  if (/^https?:\/\//i.test(cleaned)) return cleaned;
  return null;
}

export function cleanPublicAssetJsonArray(value: unknown) {
  const items = parseArray(value)
    .map((item) => cleanPublicAssetPath(item))
    .filter(Boolean);
  return JSON.stringify(items);
}

function parseArray(value: unknown) {
  if (Array.isArray(value)) return value;
  if (typeof value !== "string") return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
