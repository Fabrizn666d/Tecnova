import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { parseJsonArray, productImage } from "@/lib/catalog";
import { prisma } from "@/lib/prisma";
import { getSettingsMap } from "@/lib/settings";
import { repairText as repairUtf8Text } from "@/lib/text";
import { CheckCircle2, MessageCircle } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const service = await prisma.service.findFirst({ where: { slug, activo: true } });
  if (!service) return { title: "Servicio no encontrado | Tecnova Perú" };
  return {
    title: `${service.nombre} | Servicios Tecnova Perú`,
    description: service.descripcion,
  };
}

export default async function ServicioPage({ params }: Props) {
  const { slug } = await params;
  const settings = await getSettingsMap();
  const service = await prisma.service.findFirst({ where: { slug, activo: true } });
  if (!service) notFound();
  const [projects, faqs] = await Promise.all([
    prisma.project.findMany({ where: { activo: true, categoria: { contains: service.nombre } }, take: 3 }),
    prisma.fAQ.findMany({ where: { activo: true, OR: [{ categoria: slug }, { categoria: "servicio" }] }, orderBy: { orden: "asc" }, take: 6 }),
  ]);
  const benefits = parseJsonArray<string>(service.caracteristicas);
  const image = service.imagen || "/products/horno-doble-industrial.jpg";

  return (
    <main className="min-h-screen bg-white text-tecnova-dark">
      <SiteHeader whatsapp={settings.whatsapp} whatsappDisplay={settings.whatsapp_display} logo={settings.logo_principal} />
      <section className="mx-auto grid max-w-[1540px] gap-7 px-4 py-8 sm:px-5 lg:grid-cols-[1fr_0.85fr] lg:px-14">
        <div className="rounded-[30px] bg-neutral-100 p-7 sm:p-10">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-tecnova-red">Servicio industrial</p>
          <h1 className="mt-3 text-4xl font-black leading-none tracking-[-0.055em] sm:text-6xl">{service.nombre}</h1>
          <p className="mt-5 text-base font-semibold leading-7 text-tecnova-steel">{service.descripcionLarga || service.descripcion}</p>
          <a href={`https://wa.me/${settings.whatsapp}?text=${encodeURIComponent(`Hola Tecnova, quiero solicitar el servicio de ${service.nombre}.`)}`} target="_blank" rel="noreferrer" className="mt-7 inline-flex items-center gap-2 rounded-full bg-tecnova-red px-6 py-3 text-sm font-black text-white">
            <MessageCircle size={17} /> CTA WhatsApp
          </a>
        </div>
        <div className="relative min-h-[360px] overflow-hidden rounded-[30px] bg-neutral-100 shadow-soft">
          <Image src={image} alt={service.nombre} fill sizes="(max-width: 1024px) 100vw, 45vw" className="object-cover" />
        </div>
      </section>

      <section className="mx-auto grid max-w-[1540px] gap-5 px-4 py-8 sm:px-5 lg:grid-cols-3 lg:px-14">
        {(benefits.length ? benefits : ["Diagnóstico técnico", "Plan de trabajo", "Soporte postservicio"]).map((benefit) => (
          <div key={benefit} className="rounded-[24px] bg-white p-6 shadow-soft ring-1 ring-black/5">
            <CheckCircle2 className="h-8 w-8 text-tecnova-red" />
            <p className="mt-4 text-lg font-black">{benefit}</p>
          </div>
        ))}
      </section>

      {projects.length > 0 && (
        <section className="mx-auto max-w-[1540px] px-4 py-8 sm:px-5 lg:px-14">
          <h2 className="text-3xl font-black tracking-[-0.05em] sm:text-5xl">Trabajos relacionados</h2>
          <div className="mt-6 grid gap-5 md:grid-cols-3">
            {projects.map((project) => (
              <article key={project.id} className="overflow-hidden rounded-[26px] bg-white shadow-soft ring-1 ring-black/5">
                <div className="relative aspect-[4/3] bg-neutral-100">
                  <Image src={productImage({ imagenPrincipal: null, imagenes: project.imagenes })} alt={project.titulo} fill sizes="33vw" className="object-cover" />
                </div>
                <div className="p-5">
                  <h3 className="text-xl font-black">{project.titulo}</h3>
                  <p className="mt-2 text-sm font-semibold leading-6 text-tecnova-steel">{project.descripcion}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {faqs.length > 0 && (
        <section className="mx-auto max-w-[1000px] px-4 py-8 sm:px-5 lg:px-14">
          <h2 className="text-3xl font-black tracking-[-0.05em]">Preguntas frecuentes</h2>
          <div className="mt-6 grid gap-4">
            {faqs.map((faq) => (
              <details key={faq.id} className="group rounded-lg bg-white p-5 shadow-soft ring-1 ring-black/5 sm:p-6">
                <summary className="flex cursor-pointer list-none items-start justify-between gap-4 text-base font-black leading-6">
                  <span className="pt-0.5">{repairUtf8Text(faq.pregunta)}</span>
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white text-tecnova-red transition group-open:rotate-45">+</span>
                </summary>
                <p className="mt-5 border-t border-neutral-200 pt-5 text-sm font-semibold leading-7 text-tecnova-steel">{repairUtf8Text(faq.respuesta)}</p>
              </details>
            ))}
          </div>
        </section>
      )}

      <SiteFooter settings={settings} />
    </main>
  );
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function repairText(value: string) {
  const bad = "\uFFFD";
  return value
    .replaceAll(`${bad}Realizan instalaci${bad}n?`, "¿Realizan instalación?")
    .replaceAll(`instalaci${bad}n`, "instalación")
    .replaceAll(`coordinaci${bad}n`, "coordinación")
    .replaceAll(`ubicaci${bad}n`, "ubicación")
    .replaceAll(`S${bad}`, "Sí")
    .replaceAll(`t${bad}cnica`, "técnica")
    .replaceAll(`el${bad}ctricos`, "eléctricos");
}
