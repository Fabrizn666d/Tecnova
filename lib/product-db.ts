import { prisma } from "@/lib/prisma";

let backgroundColumnPromise: Promise<boolean> | null = null;

export const productBaseSelect = {
  id: true,
  tipo: true,
  nombre: true,
  slug: true,
  subtitulo: true,
  descripcionCorta: true,
  descripcionLarga: true,
  categoryId: true,
  category: true,
  marca: true,
  modelo: true,
  codigoRef: true,
  condicion: true,
  precio: true,
  precioAnterior: true,
  mostrarPrecio: true,
  etiquetaPrecio: true,
  imagenes: true,
  imagenPrincipal: true,
  videoUrl: true,
  mostrarVideo: true,
  especificaciones: true,
  caracteristicas: true,
  aplicaciones: true,
  compatibilidad: true,
  archivos: true,
  activo: true,
  destacado: true,
  ordenDestacado: true,
  destacadoRepuesto: true,
  ordenRepuesto: true,
  nuevo: true,
  disponible: true,
  etiqueta: true,
  seoTitulo: true,
  seoDesc: true,
  vistas: true,
  cotizaciones: true,
  tags: true,
  createdAt: true,
  updatedAt: true,
} as const;

export async function hasProductBackgroundImageColumn() {
  backgroundColumnPromise ??= prisma
    .$queryRaw<Array<{ name: string }>>`PRAGMA table_info("Product")`
    .then((columns) => columns.some((column) => column.name === "backgroundImage"))
    .catch(() => false);
  return backgroundColumnPromise;
}

export async function productSelectWithOptionalBackground() {
  return {
    ...productBaseSelect,
    ...((await hasProductBackgroundImageColumn()) ? { backgroundImage: true } : {}),
  };
}

export async function stripUnsupportedProductFields<T extends Record<string, unknown>>(data: T) {
  if (!(await hasProductBackgroundImageColumn())) {
    delete data.backgroundImage;
  }
  return data;
}

export function getProductBackgroundImage(product: unknown) {
  if (typeof product !== "object" || !product || !("backgroundImage" in product)) return null;
  const value = (product as { backgroundImage?: unknown }).backgroundImage;
  return typeof value === "string" && value ? value : null;
}
