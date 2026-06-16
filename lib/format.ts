export function formatPrice(price?: number | null, showPrice?: boolean | null, label?: string | null) {
  if (!showPrice || price == null) return label || "Consultar precio";
  const currency = label === "USD" ? "USD" : "PEN";
  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(price);
}
