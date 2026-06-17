import { prisma } from "@/lib/prisma";
import type { BrandOption, CatalogCard, CatalogKind, CategoryOption } from "@/lib/catalog-types";
import type { Prisma } from "@prisma/client";
import { existsSync } from "fs";
import path from "path";

export type CatalogItem = Prisma.ProductGetPayload<{ include: { category: true } }>;

export type SpecItem = {
  clave: string;
  valor: string;
};

export function parseJsonArray<T = unknown>(value?: string | null): T[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

const imageFallback = "/hero-tecnova-industrial.png";

export function safeImagePath(src?: string | null) {
  if (!src) return "";
  if (src.startsWith("http://") || src.startsWith("https://") || src.startsWith("blob:")) return src;
  if (!src.startsWith("/")) return "";
  const cleanPath = src.split("?")[0];
  const fullPath = path.join(process.cwd(), "public", cleanPath);
  return existsSync(fullPath) ? src : "";
}

export function productImage(product: Pick<CatalogItem, "imagenPrincipal" | "imagenes">) {
  const candidates = [product.imagenPrincipal, ...parseJsonArray<string>(product.imagenes)];
  return candidates.map((item) => safeImagePath(item)).find(Boolean) || imageFallback;
}

export function productHref(product: Pick<CatalogItem, "tipo" | "slug">) {
  return product.tipo === "repuesto" ? `/repuestos/${product.slug}` : `/productos/${product.slug}`;
}

export function toCatalogCard(product: CatalogItem): CatalogCard {
  return {
    id: product.id,
    tipo: product.tipo === "repuesto" ? "repuesto" : "producto",
    nombre: product.nombre,
    slug: product.slug,
    descripcionCorta: product.descripcionCorta,
    categoria: product.category.nombre,
    categoriaSlug: product.category.slug,
    marca: product.marca,
    modelo: product.modelo,
    condicion: product.condicion,
    precio: product.precio,
    mostrarPrecio: product.mostrarPrecio,
    etiquetaPrecio: product.etiquetaPrecio,
    imagen: productImage(product),
    disponible: product.disponible,
    destacado: product.tipo === "repuesto" ? product.destacadoRepuesto : product.destacado,
    cotizaciones: product.cotizaciones,
    caracteristicas: parseJsonArray<string>(product.caracteristicas),
  };
}

export function formatPrice(price?: number | null, showPrice?: boolean | null, label?: string | null) {
  if (!showPrice || price == null) return label || "Consultar precio";
  const currency = label === "USD" ? "USD" : "PEN";
  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(price);
}

export async function getCatalogItems(kind: CatalogKind) {
  return prisma.product.findMany({
    where: { activo: true, tipo: kind },
    include: { category: true },
    orderBy:
      kind === "repuesto"
        ? [{ destacadoRepuesto: "desc" }, { ordenRepuesto: "asc" }, { createdAt: "desc" }]
        : [{ destacado: "desc" }, { ordenDestacado: "asc" }, { createdAt: "desc" }],
    take: 120,
  });
}

export async function getFeaturedProducts() {
  return prisma.product.findMany({
    where: { activo: true, tipo: "producto", destacado: true },
    include: { category: true },
    orderBy: [{ ordenDestacado: "asc" }, { createdAt: "desc" }],
    take: 6,
  });
}

export async function getFeaturedSpareParts() {
  return prisma.product.findMany({
    where: { activo: true, tipo: "repuesto", destacadoRepuesto: true },
    include: { category: true },
    orderBy: [{ ordenRepuesto: "asc" }, { createdAt: "desc" }],
    take: 6,
  });
}

export async function getCatalogFilters(kind?: CatalogKind) {
  const [categories, brands] = await Promise.all([
    prisma.category.findMany({ where: { activo: true }, orderBy: { orden: "asc" } }),
    prisma.brand.findMany({ where: { activo: true }, orderBy: { orden: "asc" } }),
  ]);

  const categoryOptions: CategoryOption[] = categories.map((category) => ({
    id: category.id,
    nombre: category.nombre,
    slug: category.slug,
  }));
  const brandOptions: BrandOption[] = brands.map((brand) => ({
    id: brand.id,
    nombre: brand.nombre,
    logo: brand.logo,
  }));

  if (!kind) return { categories: categoryOptions, brands: brandOptions };

  const usedCategoryIds = await prisma.product.findMany({
    where: { activo: true, tipo: kind },
    select: { categoryId: true },
    distinct: ["categoryId"],
  });
  const ids = new Set(usedCategoryIds.map((item) => item.categoryId));

  return {
    categories: categoryOptions.filter((category) => ids.has(category.id)),
    brands: brandOptions,
  };
}
