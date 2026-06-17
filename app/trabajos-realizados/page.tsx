import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { productImage } from "@/lib/catalog";
import { prisma } from "@/lib/prisma";
import { getSettingsMap } from "@/lib/settings";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Trabajos realizados | Tecnova Perú",
  description: "Reparaciones, mantenimientos, automatizaciones, instalaciones y entregas realizadas por Tecnova.",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function TrabajosPage() {
  const settings = await getSettingsMap();
  const projects = await prisma.project.findMany({ where: { activo: true }, orderBy: [{ destacado: "desc" }, { orden: "asc" }] });

  return (
    <main className="min-h-screen bg-white text-tecnova-dark">
      <SiteHeader whatsapp={settings.whatsapp} whatsappDisplay={settings.whatsapp_display} logo={settings.logo_principal} />
      <section className="bg-neutral-100 px-4 py-10 sm:px-5 lg:px-14">
        <div className="mx-auto max-w-[1540px]">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-tecnova-red">Trabajos realizados</p>
          <h1 className="mt-3 max-w-4xl text-4xl font-black leading-none tracking-[-0.055em] sm:text-6xl">Instalaciones, reparaciones y mantenimientos publicados</h1>
        </div>
      </section>
      <section className="mx-auto grid max-w-[1540px] gap-5 px-4 py-10 sm:px-5 md:grid-cols-2 lg:grid-cols-3 lg:px-14">
        {projects.map((project) => (
          <Link key={project.id} href={`/trabajos-realizados/${project.slug}`} className="group overflow-hidden rounded-[26px] bg-white shadow-soft ring-1 ring-black/5 transition hover:-translate-y-1 hover:shadow-lift">
            <div className="relative aspect-[4/3] bg-neutral-100">
              <Image src={productImage({ imagenPrincipal: null, imagenes: project.imagenes })} alt={project.titulo} fill sizes="(max-width: 1024px) 100vw, 33vw" className="object-cover transition duration-700 group-hover:scale-105" />
            </div>
            <div className="p-5">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-tecnova-red">{project.categoria || "Trabajo"}</p>
              <h2 className="mt-2 text-2xl font-black">{project.titulo}</h2>
              <p className="mt-3 text-sm font-semibold leading-6 text-tecnova-steel">{project.descripcion}</p>
            </div>
          </Link>
        ))}
      </section>
      <SiteFooter settings={settings} />
    </main>
  );
}
