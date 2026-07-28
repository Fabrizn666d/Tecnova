import { prisma } from "@/lib/prisma";

let backgroundColumnPromise: Promise<boolean> | null = null;
let productColumnsPromise: Promise<Set<string>> | null = null;

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
  backgroundColumnPromise ??= hasProductColumn("backgroundImage");
  return backgroundColumnPromise;
}

export async function productSelectWithOptionalBackground() {
  const columns = await getProductColumns();
  return {
    ...productBaseSelect,
    ...(columns.has("backgroundImage") ? { backgroundImage: true } : {}),
    ...(columns.has("imageScale") ? { imageScale: true } : {}),
    ...(columns.has("imagePositionX") ? { imagePositionX: true } : {}),
    ...(columns.has("imagePositionY") ? { imagePositionY: true } : {}),
  };
}

export async function stripUnsupportedProductFields<T extends Record<string, unknown>>(data: T) {
  const columns = await getProductColumns();
  for (const field of ["backgroundImage", "imageScale", "imagePositionX", "imagePositionY"]) {
    if (!columns.has(field)) delete data[field];
  }
  return data;
}

export function getProductBackgroundImage(product: unknown) {
  if (typeof product !== "object" || !product || !("backgroundImage" in product)) return null;
  const value = (product as { backgroundImage?: unknown }).backgroundImage;
  return typeof value === "string" && value ? value : null;
}

export function getProductImageConfig(product: unknown) {
  if (typeof product !== "object" || !product) {
    return { imageScale: null, imagePositionX: null, imagePositionY: null };
  }
  const record = product as Record<string, unknown>;
  return {
    imageScale: finiteOrNull(record.imageScale),
    imagePositionX: finiteOrNull(record.imagePositionX),
    imagePositionY: finiteOrNull(record.imagePositionY),
  };
}

async function getProductColumns() {
  productColumnsPromise ??= prisma
    .$queryRaw<Array<{ name: string }>>`PRAGMA table_info("Product")`
    .then((columns) => new Set(columns.map((column) => column.name)))
    .catch(() => new Set<string>());
  return productColumnsPromise;
}

async function hasProductColumn(column: string) {
  return (await getProductColumns()).has(column);
}

function finiteOrNull(value: unknown) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}
