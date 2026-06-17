import { prisma } from "@/lib/prisma";
import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://tecnovaperu.com";
  const [products, spareParts, services, projects, categories] = await Promise.all([
    prisma.product.findMany({ where: { activo: true, tipo: "producto" }, select: { slug: true, updatedAt: true } }),
    prisma.product.findMany({ where: { activo: true, tipo: "repuesto" }, select: { slug: true, updatedAt: true } }),
    prisma.service.findMany({ where: { activo: true }, select: { slug: true, updatedAt: true } }),
    prisma.project.findMany({ where: { activo: true }, select: { slug: true, updatedAt: true } }),
    prisma.category.findMany({ where: { activo: true }, select: { slug: true, updatedAt: true } }),
  ]);

  const staticRoutes = [
    "",
    "/productos",
    "/repuestos",
    "/servicios",
    "/trabajos-realizados",
    "/nosotros",
    "/contacto",
    "/libro-de-reclamaciones",
  ].map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
  }));

  return [
    ...staticRoutes,
    ...products.map((item) => ({ url: `${baseUrl}/productos/${item.slug}`, lastModified: item.updatedAt })),
    ...spareParts.map((item) => ({ url: `${baseUrl}/repuestos/${item.slug}`, lastModified: item.updatedAt })),
    ...categories.map((item) => ({ url: `${baseUrl}/productos?categoria=${item.slug}`, lastModified: item.updatedAt })),
    ...categories.map((item) => ({ url: `${baseUrl}/repuestos?categoria=${item.slug}`, lastModified: item.updatedAt })),
    ...services.map((item) => ({ url: `${baseUrl}/servicios/${item.slug}`, lastModified: item.updatedAt })),
    ...projects.map((item) => ({ url: `${baseUrl}/trabajos-realizados/${item.slug}`, lastModified: item.updatedAt })),
  ];
}
