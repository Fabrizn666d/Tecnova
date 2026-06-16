export function formatPrice(price?: number | null, showPrice?: boolean | null, label?: string | null) {
  if (!showPrice || price == null) return label || "Consultar precio";
  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
    maximumFractionDigits: 0,
  }).format(price);
}
