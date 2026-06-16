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
