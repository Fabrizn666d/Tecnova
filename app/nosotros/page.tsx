import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { prisma } from "@/lib/prisma";
import { getSettingsMap } from "@/lib/settings";
import { Factory, ShieldCheck, Users } from "lucide-react";
import type { Metadata } from "next";
import type { ComponentType } from "react";

export const metadata: Metadata = {
  title: "Nosotros | Tecnova Perú",
  description: "Historia, experiencia y capacidad técnica de Tecnova Perú en maquinaria industrial.",
};

export default async function NosotrosPage() {
  const settings = await getSettingsMap();
  const [brands, projects, products] = await Promise.all([
    prisma.brand.count({ where: { activo: true } }),
    prisma.project.count({ where: { activo: true } }),
    prisma.product.count({ where: { activo: true } }),
  ]);

  return (
    <main className="min-h-screen bg-white text-tecnova-dark">
      <SiteHeader whatsapp={settings.whatsapp} whatsappDisplay={settings.whatsapp_display} />
      <section className="mx-auto max-w-[1540px] px-4 py-10 sm:px-5 lg:px-14">
        <div className="grid gap-7 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[30px] bg-black p-7 text-white shadow-lift sm:p-10">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-red-200">Nosotros</p>
            <h1 className="mt-3 text-4xl font-black leading-none tracking-[-0.055em] sm:text-6xl">Experiencia técnica para producción industrial</h1>
          </div>
          <div className="rounded-[30px] bg-neutral-100 p-7 sm:p-10">
            <h2 className="text-3xl font-black">Historia y enfoque</h2>
            <p className="mt-4 text-sm font-semibold leading-7 text-tecnova-steel">
              Tecnova Perú acompaña a panaderías, restaurantes e industria alimentaria con venta de maquinaria, repuestos, instalación, mantenimiento y automatización. El sistema está preparado para operar con datos, archivos y administración local en VPS.
            </p>
            <div className="mt-7 grid gap-4 sm:grid-cols-3">
              <Stat icon={Factory} label="Equipos y repuestos" value={`${products}+`} />
              <Stat icon={ShieldCheck} label="Trabajos publicados" value={`${projects}+`} />
              <Stat icon={Users} label="Marcas trabajadas" value={`${brands}+`} />
            </div>
          </div>
        </div>
      </section>
      <SiteFooter settings={settings} />
    </main>
  );
}

function Stat({ icon: Icon, label, value }: { icon: ComponentType<{ size?: number; className?: string }>; label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5">
      <Icon size={24} className="text-tecnova-red" />
      <p className="mt-3 text-3xl font-black">{value}</p>
      <p className="mt-1 text-xs font-black uppercase tracking-[0.12em] text-neutral-500">{label}</p>
    </div>
  );
}
