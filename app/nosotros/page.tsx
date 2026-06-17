import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { safeImagePath } from "@/lib/catalog";
import { prisma } from "@/lib/prisma";
import { getSettingsMap } from "@/lib/settings";
import { Factory, ShieldCheck, Target, Users } from "lucide-react";
import Image from "next/image";
import type { Metadata } from "next";
import type { ComponentType } from "react";

export const metadata: Metadata = {
  title: "Nosotros | Tecnova Perú",
  description: "Historia, experiencia y capacidad técnica de Tecnova Perú en maquinaria industrial.",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function NosotrosPage() {
  const settings = await getSettingsMap();
  const [brands, projects, products] = await Promise.all([
    prisma.brand.count({ where: { activo: true } }).catch(() => 0),
    prisma.project.count({ where: { activo: true } }).catch(() => 0),
    prisma.product.count({ where: { activo: true } }).catch(() => 0),
  ]);
  const values = String(settings.nosotros_valores || "")
    .split(/\n+/)
    .map((item) => item.trim())
    .filter(Boolean);
  const stats = [
    {
      icon: Factory,
      label: settings.nosotros_stat_1_label || "Equipos y repuestos",
      value: settings.nosotros_stat_1_value || `${products}+`,
    },
    {
      icon: ShieldCheck,
      label: settings.nosotros_stat_2_label || "Trabajos publicados",
      value: settings.nosotros_stat_2_value || `${projects}+`,
    },
    {
      icon: Users,
      label: settings.nosotros_stat_3_label || "Marcas trabajadas",
      value: settings.nosotros_stat_3_value || `${brands}+`,
    },
  ];

  return (
    <main className="min-h-screen bg-white text-tecnova-dark">
      <SiteHeader whatsapp={settings.whatsapp} whatsappDisplay={settings.whatsapp_display} logo={settings.logo_principal} />
      <section className="mx-auto max-w-[1540px] px-4 py-10 sm:px-5 lg:px-14">
        <div className="grid gap-7 lg:grid-cols-[0.92fr_1.08fr] lg:items-stretch">
          <div className="relative min-h-[420px] overflow-hidden rounded-[30px] bg-black text-white shadow-lift">
            <Image src={safeImagePath(settings.nosotros_imagen) || "/hero-tecnova-industrial.png"} alt={settings.nosotros_titulo || "Tecnova Perú"} fill priority sizes="(max-width: 1024px) 100vw, 45vw" className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/10" />
            <div className="absolute inset-x-6 bottom-6 sm:inset-x-9 sm:bottom-9">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-red-200">Nosotros</p>
              <h1 className="mt-3 text-4xl font-black leading-none tracking-[-0.055em] sm:text-6xl">{settings.nosotros_titulo}</h1>
            </div>
          </div>
          <div className="rounded-[30px] bg-neutral-100 p-7 sm:p-10">
            <h2 className="text-3xl font-black">Historia y enfoque</h2>
            <p className="mt-4 text-base font-semibold leading-8 text-tecnova-steel">{settings.nosotros_subtitulo}</p>
            <p className="mt-4 text-sm font-semibold leading-7 text-tecnova-steel">{settings.nosotros_historia}</p>
            <div className="mt-7 grid gap-4 sm:grid-cols-3">
              {stats.map((stat) => (
                <Stat key={stat.label} icon={stat.icon} label={stat.label} value={stat.value} />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1540px] px-4 pb-12 sm:px-5 lg:px-14">
        <div className="grid gap-5 lg:grid-cols-3">
          <InfoCard icon={Target} title="Misión" text={settings.nosotros_mision} />
          <InfoCard icon={ShieldCheck} title="Visión" text={settings.nosotros_vision} />
          <div className="rounded-[26px] bg-white p-6 shadow-soft ring-1 ring-black/5">
            <Users className="h-9 w-9 text-tecnova-red" />
            <h2 className="mt-5 text-2xl font-black">Valores</h2>
            <div className="mt-4 grid gap-2">
              {values.map((value) => (
                <p key={value} className="rounded-lg bg-neutral-100 px-4 py-3 text-sm font-black">{value}</p>
              ))}
            </div>
          </div>
        </div>
      </section>

      <SiteFooter settings={settings} />
    </main>
  );
}

function InfoCard({ icon: Icon, title, text }: { icon: ComponentType<{ size?: number; className?: string }>; title: string; text?: string }) {
  return (
    <div className="rounded-[26px] bg-white p-6 shadow-soft ring-1 ring-black/5">
      <Icon size={36} className="text-tecnova-red" />
      <h2 className="mt-5 text-2xl font-black">{title}</h2>
      <p className="mt-3 text-sm font-semibold leading-7 text-tecnova-steel">{text}</p>
    </div>
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
