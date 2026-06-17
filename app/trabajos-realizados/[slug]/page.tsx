import ProductGallery from "@/components/ProductGallery";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { parseJsonArray, productImage, safeImagePath } from "@/lib/catalog";
import { prisma } from "@/lib/prisma";
import { getSettingsMap } from "@/lib/settings";
import { MessageCircle } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ slug: string }>;
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = await prisma.project.findFirst({ where: { slug, activo: true } });
  if (!project) return { title: "Trabajo no encontrado | Tecnova Perú" };
  return {
    title: `${project.titulo} | Trabajos Tecnova Perú`,
    description: project.descripcion || "Trabajo realizado por Tecnova Perú.",
  };
}

export default async function TrabajoPage({ params }: Props) {
  const { slug } = await params;
  const settings = await getSettingsMap();
  const project = await prisma.project.findFirst({ where: { slug, activo: true } });
  if (!project) notFound();
  const images = [
    productImage({ imagenPrincipal: null, imagenes: project.imagenes }),
    ...parseJsonArray<string>(project.imagenes).map((image) => safeImagePath(image)),
  ].filter(Boolean);

  return (
    <main className="min-h-screen bg-white text-tecnova-dark">
      <SiteHeader whatsapp={settings.whatsapp} whatsappDisplay={settings.whatsapp_display} logo={settings.logo_principal} />
      <section className="mx-auto max-w-[1200px] px-4 py-8 sm:px-5 lg:px-14">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-tecnova-red">{project.categoria || "Trabajo realizado"}</p>
        <h1 className="mt-3 text-4xl font-black leading-none tracking-[-0.055em] sm:text-6xl">{project.titulo}</h1>
        <p className="mt-5 text-base font-semibold leading-7 text-tecnova-steel">{project.descripcion}</p>
        <div className="mt-7">
          <ProductGallery images={images} alt={project.titulo} />
        </div>
        <a href={`https://wa.me/${settings.whatsapp}?text=${encodeURIComponent(`Hola Tecnova, quiero solicitar un servicio similar a: ${project.titulo}.`)}`} target="_blank" rel="noreferrer" className="mt-7 inline-flex items-center gap-2 rounded-full bg-tecnova-red px-6 py-3 text-sm font-black text-white">
          <MessageCircle size={17} /> Solicitar servicio similar
        </a>
      </section>
      <SiteFooter settings={settings} />
    </main>
  );
}
