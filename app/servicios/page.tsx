import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { prisma } from "@/lib/prisma";
import { getSettingsMap } from "@/lib/settings";
import { ArrowRight, ShieldCheck } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Servicios industriales | Tecnova Perú",
  description: "Mantenimiento, reparación, automatización e instalación de maquinaria industrial.",
};

export default async function ServiciosPage() {
  const settings = await getSettingsMap();
  const services = await prisma.service.findMany({ where: { activo: true }, orderBy: { orden: "asc" } });

  return (
    <main className="min-h-screen bg-white text-tecnova-dark">
      <SiteHeader whatsapp={settings.whatsapp} whatsappDisplay={settings.whatsapp_display} />
      <section className="bg-neutral-100 px-4 py-10 sm:px-5 lg:px-14">
        <div className="mx-auto max-w-[1540px]">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-tecnova-red">Servicios</p>
          <h1 className="mt-3 max-w-4xl text-4xl font-black leading-none tracking-[-0.055em] sm:text-6xl">Soporte técnico para mantener tu producción activa</h1>
        </div>
      </section>
      <section className="mx-auto grid max-w-[1540px] gap-5 px-4 py-10 sm:px-5 md:grid-cols-2 lg:grid-cols-4 lg:px-14">
        {services.map((service) => (
          <Link key={service.id} href={`/servicios/${service.slug}`} className="rounded-[26px] bg-white p-6 shadow-soft ring-1 ring-black/5 transition hover:-translate-y-1 hover:shadow-lift">
            <ShieldCheck className="h-10 w-10 text-tecnova-red" />
            <h2 className="mt-5 text-2xl font-black">{service.nombre}</h2>
            <p className="mt-3 text-sm font-semibold leading-6 text-tecnova-steel">{service.descripcion}</p>
            <span className="mt-5 inline-flex items-center gap-2 text-sm font-black text-tecnova-red">
              Ver servicio <ArrowRight size={16} />
            </span>
          </Link>
        ))}
      </section>
      <SiteFooter settings={settings} />
    </main>
  );
}
