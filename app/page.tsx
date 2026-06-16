import ProductCard from "@/components/ProductCard";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { getFeaturedProducts, getFeaturedSpareParts, productImage, toCatalogCard } from "@/lib/catalog";
import { prisma } from "@/lib/prisma";
import { getSettingsMap } from "@/lib/settings";
import { ArrowRight, Flame, Headphones, Layers, Settings, ShieldCheck, Wrench, Zap } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const categoryIcons = {
  hornos: Flame,
  laminadoras: Layers,
  quemadores: Zap,
  repuestos: Settings,
  "servicio-tecnico": Headphones,
};

export default async function Home() {
  const settings = await getSettingsMap();
  const [featuredProducts, featuredSpareParts, categories, brands, services, projects] = await Promise.all([
    getFeaturedProducts().catch(() => []),
    getFeaturedSpareParts().catch(() => []),
    prisma.category.findMany({
      where: { activo: true, slug: { in: ["hornos", "laminadoras", "quemadores", "repuestos"] } },
      orderBy: { orden: "asc" },
    }).catch(() => []),
    prisma.brand.findMany({ where: { activo: true }, orderBy: { orden: "asc" }, take: 12 }).catch(() => []),
    prisma.service.findMany({ where: { activo: true, slug: { in: ["reparacion", "mantenimiento", "automatizacion", "instalacion"] } }, orderBy: { orden: "asc" } }).catch(() => []),
    prisma.project.findMany({ where: { activo: true }, orderBy: [{ destacado: "desc" }, { orden: "asc" }], take: 3 }).catch(() => []),
  ]);
  const heroBanner = await prisma.banner
    .findFirst({ where: { activo: true, posicion: "hero" }, orderBy: { orden: "asc" } })
    .catch(() => null);

  const mainCategories = [
    ...categories.map((category) => ({
      name: category.nombre,
      slug: category.slug,
      href: category.slug === "repuestos" ? "/repuestos" : `/productos?categoria=${category.slug}`,
    })),
    { name: "Servicio Técnico", slug: "servicio-tecnico", href: "/servicios" },
  ].slice(0, 5);
  const brandLogos = brands.filter((brand) => Boolean(brand.logo));
  const marqueeBrands = [...brandLogos, ...brandLogos];

  return (
    <main className="min-h-screen bg-white text-tecnova-dark">
      <SiteHeader whatsapp={settings.whatsapp} whatsappDisplay={settings.whatsapp_display} logo={settings.logo_principal} />

      <section className="mx-auto grid max-w-[1540px] gap-5 px-4 py-5 sm:px-5 lg:grid-cols-[1.35fr_0.65fr] lg:px-14 lg:py-8">
        <article className="relative min-h-[560px] overflow-hidden rounded-[30px] bg-black text-white shadow-lift">
          <Image src={heroBanner?.imagenDesktop || "/hero-tecnova-industrial.png"} alt={heroBanner?.titulo || "Tecnova maquinaria industrial"} fill priority sizes="(max-width: 1024px) 100vw, 68vw" className="object-cover object-[62%_center]" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/88 via-black/45 to-black/10" />
          <div className="absolute inset-x-5 top-8 max-w-2xl sm:left-9 sm:right-auto sm:top-1/2 sm:-translate-y-1/2 lg:left-12">
            <p className="inline-flex rounded-full bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-red-200 backdrop-blur">
              {heroBanner?.subtitulo || "Maquinaria industrial en Perú"}
            </p>
            <h1 className="mt-5 text-4xl font-black leading-none tracking-[-0.055em] sm:text-6xl lg:text-7xl">
              {heroBanner?.titulo || "Tecnología confiable para producción real"}
            </h1>
            <p className="mt-5 max-w-xl text-base font-semibold leading-7 text-white/78">
              {heroBanner?.descripcion || "Venta de equipos, repuestos, instalación, mantenimiento y reparación para panaderías, restaurantes e industria alimentaria."}
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href={heroBanner?.ctaLink || "#productos"} className="inline-flex items-center gap-2 rounded-full bg-tecnova-red px-5 py-3 text-sm font-black text-white hover:bg-red-700">
                {heroBanner?.ctaTexto || "Ver Productos"} <ArrowRight size={17} />
              </Link>
              <Link href={heroBanner?.ctaLink2 || "#repuestos"} className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-black text-black hover:bg-neutral-100">
                {heroBanner?.ctaTexto2 || "Ver Repuestos"} <ArrowRight size={17} />
              </Link>
              <Link href="/cotizacion" className="inline-flex items-center gap-2 rounded-full bg-amber-300 px-5 py-3 text-sm font-black text-black hover:bg-amber-200">
                Solicitar Cotización
              </Link>
            </div>
          </div>
        </article>

        <aside className="grid gap-5">
          <div className="rounded-[28px] bg-tecnova-red p-6 text-white shadow-soft">
            <ShieldCheck className="h-10 w-10" />
            <h2 className="mt-6 text-3xl font-black leading-none">Soporte técnico especializado</h2>
            <p className="mt-4 text-sm font-semibold leading-6 text-white/78">Diagnóstico, instalación y mantenimiento para mantener tu operación activa.</p>
            <Link href="/servicios" className="mt-6 inline-flex items-center gap-2 text-sm font-black">
              Ver servicios <ArrowRight size={16} />
            </Link>
          </div>
          <div className="rounded-[28px] bg-neutral-100 p-6 shadow-soft">
            <Wrench className="h-10 w-10 text-tecnova-red" />
            <h2 className="mt-6 text-3xl font-black leading-none">Repuestos para hornos y líneas industriales</h2>
            <p className="mt-4 text-sm font-semibold leading-6 text-tecnova-steel">Motores, tableros, controladores, resistencias, termostatos y componentes técnicos.</p>
          </div>
        </aside>
      </section>

      <section className="mx-auto max-w-[1540px] px-4 py-8 sm:px-5 lg:px-14">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-tecnova-red">Categorías principales</p>
            <h2 className="mt-2 text-3xl font-black tracking-[-0.05em] sm:text-5xl">Accesos rápidos</h2>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {mainCategories.map((category) => {
            const Icon = categoryIcons[category.slug as keyof typeof categoryIcons] || Settings;
            return (
              <Link key={category.slug} href={category.href} className="group rounded-[24px] bg-neutral-100 p-5 shadow-sm ring-1 ring-black/5 transition hover:-translate-y-1 hover:bg-white hover:shadow-soft">
                <span className="grid h-12 w-12 place-items-center rounded-full bg-white text-tecnova-red shadow-sm transition group-hover:bg-tecnova-red group-hover:text-white">
                  <Icon size={24} />
                </span>
                <h3 className="mt-5 text-xl font-black">{category.name}</h3>
              </Link>
            );
          })}
        </div>
      </section>

      <HomeCatalog id="productos" title="Productos destacados" href="/productos" items={featuredProducts.map(toCatalogCard)} />
      <HomeCatalog id="repuestos" title="Repuestos destacados" href="/repuestos" items={featuredSpareParts.map(toCatalogCard)} />

      {brandLogos.length > 0 && (
        <section className="mx-auto max-w-[1540px] px-4 py-8 sm:px-5 lg:px-14">
          <div className="mb-5">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-tecnova-red">Marcas</p>
            <h2 className="mt-2 text-3xl font-black tracking-[-0.05em]">Componentes y equipos que trabajamos</h2>
          </div>
          <div className="brand-marquee overflow-hidden py-4">
            <div className="brand-marquee-track flex w-max items-center gap-12">
              {marqueeBrands.map((brand, index) => (
                <div key={`${brand.id}-${index}`} className="flex h-20 w-44 shrink-0 items-center justify-center">
                  <Image src={brand.logo || "/logo.png"} alt={brand.nombre} width={160} height={64} className="max-h-16 w-auto max-w-full object-contain" />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="mx-auto max-w-[1540px] px-4 py-8 sm:px-5 lg:px-14">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-tecnova-red">Servicios destacados</p>
            <h2 className="mt-2 text-3xl font-black tracking-[-0.05em] sm:text-5xl">Soporte para tu operación</h2>
          </div>
          <Link href="/servicios" className="hidden rounded-full bg-black px-5 py-3 text-sm font-black text-white sm:inline-flex">Ver servicios</Link>
        </div>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {services.map((service) => (
            <Link key={service.id} href={`/servicios/${service.slug}`} className="rounded-[24px] bg-white p-6 shadow-soft ring-1 ring-black/5 transition hover:-translate-y-1 hover:shadow-lift">
              <Zap className="h-9 w-9 text-tecnova-red" />
              <h3 className="mt-5 text-2xl font-black">{service.nombre}</h3>
              <p className="mt-3 text-sm font-semibold leading-6 text-tecnova-steel">{service.descripcion}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1540px] px-4 py-8 sm:px-5 lg:px-14">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-tecnova-red">Trabajos realizados</p>
            <h2 className="mt-2 text-3xl font-black tracking-[-0.05em] sm:text-5xl">Últimos trabajos publicados</h2>
          </div>
          <Link href="/trabajos-realizados" className="hidden rounded-full bg-black px-5 py-3 text-sm font-black text-white sm:inline-flex">Ver trabajos</Link>
        </div>
        <div className="grid gap-5 lg:grid-cols-3">
          {projects.map((project) => (
            <Link key={project.id} href={`/trabajos-realizados/${project.slug}`} className="group overflow-hidden rounded-[26px] bg-white shadow-soft ring-1 ring-black/5 transition hover:-translate-y-1 hover:shadow-lift">
              <div className="relative aspect-[4/3] overflow-hidden bg-neutral-100">
                <Image src={productImage({ imagenPrincipal: null, imagenes: project.imagenes })} alt={project.titulo} fill sizes="(max-width: 1024px) 100vw, 33vw" className="object-cover transition duration-700 group-hover:scale-105" />
              </div>
              <div className="p-5">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-tecnova-red">{project.categoria || "Proyecto"}</p>
                <h3 className="mt-2 text-2xl font-black">{project.titulo}</h3>
                <p className="mt-3 text-sm font-semibold leading-6 text-tecnova-steel">{project.descripcion}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1540px] px-4 py-10 sm:px-5 lg:px-14">
        <div className="rounded-[30px] bg-tecnova-red p-7 text-white shadow-lift sm:p-10 lg:p-12">
          <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-white/70">Cotización técnica</p>
              <h2 className="mt-3 text-3xl font-black leading-none tracking-[-0.05em] sm:text-5xl">Cuéntanos qué equipo o repuesto necesitas.</h2>
            </div>
            <Link href="/contacto" className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-black text-black hover:bg-neutral-100">
              Solicitar cotización
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter settings={settings} />
    </main>
  );
}

function HomeCatalog({
  id,
  title,
  href,
  items,
}: {
  id: string;
  title: string;
  href: string;
  items: ReturnType<typeof toCatalogCard>[];
}) {
  return (
    <section id={id} className="scroll-mt-28 mx-auto max-w-[1540px] px-4 py-8 sm:px-5 lg:px-14">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-tecnova-red">Catálogo Tecnova</p>
          <h2 className="mt-2 text-3xl font-black tracking-[-0.05em] sm:text-5xl">{title}</h2>
        </div>
        <Link href={href} className="hidden rounded-full bg-black px-5 py-3 text-sm font-black text-white sm:inline-flex">
          Ver todo
        </Link>
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <ProductCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}
