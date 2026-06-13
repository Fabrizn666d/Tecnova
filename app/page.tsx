"use client";
import Loader from "@/components/Loader";
import products from "@/data/products.json";
import Image from "next/image";
import {
  ArrowRight,
  Flame,
  Headphones,
  Mail,
  MapPin,
  Menu,
  MessageCircle,
  PackageCheck,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Wrench,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { FaFacebookF, FaInstagram, FaTiktok, FaYoutube } from "react-icons/fa";

type Product = {
  id: string;
  name: string;
  category: string;
  description: string;
  image: string;
};

const typedProducts = products as Product[];
const whatsappNumber = "51937492227";

const wa = (message: string) =>
  `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

const socials = [
  { name: "Instagram", href: "https://www.instagram.com/tecnova98", icon: FaInstagram },
  { name: "TikTok", href: "https://www.tiktok.com/@tecnovamaquinarias", icon: FaTiktok },
  { name: "Facebook", href: "https://www.facebook.com/tecnovamaq", icon: FaFacebookF },
  {
    name: "YouTube",
    href: "https://www.youtube.com/channel/UCGTwvoe_rldJZedfHkVTCDQ",
    icon: FaYoutube,
  },
];

const brandNames = [
  "NOVA",
  "WAYNE",
  "BECKETT",
  "HONEYWELL",
  "SCHNEIDER",
  "HENKEL",
  "MALQUIPAN",
  "SIEMENS",
  "DANFOSS",
];

const categoryCards = [
  ["Hornos", Flame],
  ["Laminadoras", Settings],
  ["Quemadores", Zap],
  ["Repuestos", PackageCheck],
  ["Mantenimiento", Wrench],
  ["Servicio técnico", Headphones],
] as const;

function Img({
  src,
  alt,
  className = "",
  sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
}: {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
}) {
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      className={`object-cover transition duration-700 group-hover:scale-110 ${className}`}
    />
  );
}

function Btn({
  href,
  children,
  dark = false,
}: {
  href: string;
  children: React.ReactNode;
  dark?: boolean;
}) {
  return (
    <motion.a
      href={href}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel={href.startsWith("http") ? "noreferrer" : undefined}
      whileHover={{ y: -2, scale: 1.02 }}
      whileTap={{ scale: 0.96 }}
      className={`inline-flex max-w-full items-center justify-center gap-2 whitespace-normal rounded-full px-4 py-2.5 text-center text-sm font-black transition sm:px-6 sm:py-3 [&>svg]:shrink-0 ${
        dark
          ? "bg-black text-white hover:bg-tecnova-red"
          : "bg-tecnova-red text-white hover:bg-red-700"
      }`}
    >
      {children}
    </motion.a>
  );
}

function BrandLoop() {
  const loop = [...brandNames, ...brandNames, ...brandNames];

  return (
    <section className="order-3 mx-auto max-w-[1540px] px-4 py-7 sm:px-5 lg:px-14">
      <div className="overflow-hidden rounded-[26px] bg-neutral-100 py-6 ring-1 ring-black/5 sm:rounded-[30px]">
        <div className="mb-5 flex items-center justify-between px-5 sm:px-6">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-tecnova-red sm:tracking-[0.22em]">
            Marcas y componentes
          </p>
          <p className="hidden text-sm font-bold text-tecnova-steel sm:block">
            Tecnología para maquinaria, hornos, quemadores y automatización
          </p>
        </div>

        <div className="relative overflow-hidden">
          <motion.div
            animate={{ x: ["0%", "-50%"] }}
            transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
            className="flex w-max gap-4"
          >
            {loop.map((brand, i) => (
              <div
                key={`${brand}-${i}`}
                className="flex h-16 min-w-[170px] items-center justify-center rounded-2xl bg-white px-6 shadow-sm ring-1 ring-black/5 sm:h-20 sm:min-w-[210px] sm:px-8"
              >
                <span className="text-lg font-black tracking-[-0.04em] text-neutral-800">
                  {brand}
                </span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const [activeCategory, setActiveCategory] = useState("Todos");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const categories = useMemo(
    () => ["Todos", ...Array.from(new Set(typedProducts.map((p) => p.category)))],
    []
  );

  const filteredProducts =
    activeCategory === "Todos"
      ? typedProducts
      : typedProducts.filter((p) => p.category === activeCategory);

  const navLinks = [
    ["CatÃ¡logo", "#catalogo"],
    ["Servicios", "#servicios"],
    ["Proyectos", "#proyectos"],
    ["Contacto", "#contacto"],
  ] as const;

  const services = [
    [Wrench, "ReparaciÃ³n", "DiagnÃ³stico y soluciÃ³n de fallas."],
    [ShieldCheck, "Mantenimiento", "Preventivo y correctivo."],
    [Zap, "AutomatizaciÃ³n", "Controladores, tableros y mejoras."],
    [Headphones, "AsesorÃ­a", "CotizaciÃ³n directa por WhatsApp."],
  ] satisfies [LucideIcon, string, string][];

  const legacyText = (value: string) =>
    value
      .replace(/\u00c3\u0192\u00c2\u00a1/g, "\u00c3\u00a1")
      .replace(/\u00c3\u0192\u00c2\u00b3/g, "\u00c3\u00b3")
      .replace(/\u00c3\u0192\u00c2\u00ad/g, "\u00c3\u00ad");

  return (
    <main className="flex min-h-screen flex-col overflow-x-clip bg-white text-tecnova-dark">
     <Loader />
      <header className="order-0 sticky top-0 z-50 border-b border-neutral-100 bg-white/90 backdrop-blur-2xl">
        <nav className="mx-auto flex max-w-[1540px] items-center justify-between gap-2 px-4 py-2.5 sm:gap-5 sm:px-5 sm:py-3 lg:gap-8 lg:px-14 lg:py-5">
          <a href="#" className="relative flex h-10 w-[132px] shrink-0 items-center sm:h-12 sm:w-[158px] lg:h-16 lg:w-[212px] lg:min-w-[190px]">
            <Image src="/logo.png" alt="Tecnova Perú" fill sizes="(max-width: 640px) 132px, (max-width: 1024px) 158px, 212px" className="object-contain object-left" />
          </a>

          <div className="hidden items-center gap-8 text-sm font-black text-neutral-700 lg:flex">
            <a href="#catalogo" className="transition hover:text-tecnova-red">Catálogo</a>
            <a href="#servicios" className="transition hover:text-tecnova-red">Servicios</a>
            <a href="#proyectos" className="transition hover:text-tecnova-red">Proyectos</a>
            <a href="#contacto" className="transition hover:text-tecnova-red">Contacto</a>
          </div>

          <div className="hidden h-12 w-[390px] items-center rounded-full border border-neutral-100 bg-neutral-50 px-5 shadow-sm lg:flex">
            <input
              placeholder="BUSCAR EQUIPOS, HORNOS, REPUESTOS..."
              className="w-full bg-transparent text-[11px] font-black uppercase tracking-[0.08em] outline-none placeholder:text-neutral-400"
            />
            <Search size={18} />
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <a
              href={wa("Hola Tecnova, quiero cotizar.")}
              target="_blank"
              rel="noreferrer"
              className="rounded-full bg-tecnova-red px-4 py-2.5 text-xs font-black text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-red-700 sm:px-5 sm:py-3 sm:text-sm lg:px-7"
            >
              Cotizar
            </a>
            <button
              type="button"
              aria-label="Abrir menÃº"
              aria-expanded={mobileMenuOpen}
              onClick={() => setMobileMenuOpen((open) => !open)}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-neutral-200 transition hover:border-tecnova-red hover:text-tecnova-red sm:h-11 sm:w-11 lg:hidden"
            >
              <Menu size={18} />
            </button>
          </div>
        </nav>
        {mobileMenuOpen && (
          <div className="mx-auto max-w-[1540px] px-4 pb-4 sm:px-5 lg:hidden">
            <div className="rounded-[24px] bg-white p-4 shadow-soft ring-1 ring-black/5">
              <div className="mb-4 flex h-11 items-center rounded-full border border-neutral-100 bg-neutral-50 px-4">
                <input
                  placeholder="BUSCAR EQUIPOS, HORNOS, REPUESTOS..."
                  className="min-w-0 flex-1 bg-transparent text-[10px] font-black uppercase tracking-[0.06em] outline-none placeholder:text-neutral-400"
                />
                <Search size={17} className="shrink-0" />
              </div>
              <div className="grid gap-2">
                {navLinks.map(([label, href]) => (
                  <a
                    key={href}
                    href={href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-2xl px-4 py-3 text-sm font-black text-neutral-700 transition hover:bg-neutral-100 hover:text-tecnova-red"
                  >
                    {legacyText(label)}
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}
      </header>

      <section className="hidden lg:order-1 lg:mx-auto lg:block lg:w-full lg:max-w-[1540px] lg:px-14 lg:pt-7">
        <div className="grid grid-cols-6 gap-4">
          {categoryCards.map(([name, Icon]) => (
            <motion.a
              href="#catalogo"
              key={name}
              whileHover={{ y: -5 }}
              className="group relative flex h-[92px] items-center gap-4 overflow-hidden rounded-[22px] bg-neutral-100 px-5 transition hover:bg-white hover:shadow-soft"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white via-transparent to-red-50 opacity-0 transition group-hover:opacity-100" />
              <span className="relative grid h-12 w-12 shrink-0 place-items-center rounded-full bg-white text-black shadow-sm transition group-hover:bg-tecnova-red group-hover:text-white">
                <Icon size={24} />
              </span>
              <span className="relative min-w-0 text-sm font-black leading-tight">{name}</span>
            </motion.a>
          ))}
        </div>
      </section>

      <section className="order-1 mx-auto max-w-[1540px] px-4 py-4 sm:px-5 lg:order-2 lg:px-14 lg:py-5">
        <div className="grid gap-5 lg:grid-cols-[2fr_1fr_1fr]">
          <motion.article
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65 }}
            className="group relative min-h-[500px] overflow-hidden rounded-[26px] bg-black text-white shadow-soft sm:min-h-[560px] lg:row-span-2 lg:min-h-[560px] lg:rounded-[32px]"
          >
<Img src="/hero-tecnova-industrial.png" alt="Tecnova Industrial" sizes="(max-width: 1024px) 100vw, 52vw" className="object-[62%_center] sm:object-center lg:object-center" />            <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/35 to-transparent" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_40%,rgba(177,18,38,0.28),transparent_35%)]" />

            <div className="absolute left-5 right-5 top-7 max-w-[470px] sm:left-8 sm:right-auto sm:top-1/2 sm:-translate-y-1/2 lg:left-10">
              <p className="inline-flex rounded-full bg-white/10 px-3.5 py-2 text-[10px] font-black uppercase tracking-[0.14em] text-red-200 backdrop-blur sm:px-4 sm:text-xs sm:tracking-[0.2em]">
                Equipos industriales
              </p>
              <h1 className="mt-4 text-[34px] font-black leading-[0.96] tracking-[-0.04em] min-[375px]:text-4xl sm:mt-5 sm:text-5xl lg:text-7xl lg:leading-[0.92] lg:tracking-[-0.07em]">
                Hornos para producción real
              </h1>
              <p className="mt-4 text-sm font-semibold leading-6 text-white/75 sm:mt-5 sm:leading-7">
                Venta, instalación, mantenimiento y reparación de maquinaria para panificación e industria.
              </p>

              <div className="mt-5 flex flex-wrap gap-2.5 sm:mt-7 sm:gap-3">
                <Btn href="#catalogo">Ver catálogo <ArrowRight size={17} /></Btn>
                <Btn href={wa("Hola Tecnova, quiero cotizar maquinaria industrial.")} dark>
                  WhatsApp <MessageCircle size={17} />
                </Btn>
              </div>
            </div>

            <div className="absolute bottom-4 left-4 right-4 grid gap-2 sm:bottom-5 sm:left-5 sm:right-5 sm:gap-3 sm:grid-cols-3">
              {["Instalación", "Reparación", "Mantenimiento"].map((item) => (
                <div key={item} className="rounded-2xl border border-white/15 bg-white/10 px-3 py-3 text-xs font-black text-white backdrop-blur-md sm:px-4 sm:py-4 sm:text-sm">
                  {item}
                </div>
              ))}
            </div>
          </motion.article>

          <section className="w-full overflow-hidden lg:hidden">
            <div className="scrollbar-hide flex gap-3 overflow-x-auto overscroll-x-contain pb-1">
              {categoryCards.map(([name, Icon]) => (
                <motion.a
                  href="#catalogo"
                  key={name}
                  whileHover={{ y: -5 }}
                  className="group relative flex h-16 min-w-[154px] shrink-0 items-center gap-2 overflow-hidden rounded-[18px] bg-neutral-100 px-3 transition hover:bg-white hover:shadow-soft sm:h-[72px] sm:min-w-[176px]"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white via-transparent to-red-50 opacity-0 transition group-hover:opacity-100" />
                  <span className="relative grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white text-black shadow-sm transition group-hover:bg-tecnova-red group-hover:text-white sm:h-10 sm:w-10">
                    <Icon size={20} />
                  </span>
                  <span className="relative min-w-0 whitespace-nowrap text-xs font-black leading-tight sm:text-sm">
                    {name}
                  </span>
                </motion.a>
              ))}
            </div>
          </section>

          <motion.article
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.08 }}
            className="group relative min-h-[380px] overflow-hidden rounded-[28px] bg-tecnova-red p-6 text-white shadow-soft sm:p-8 lg:row-span-2 lg:min-h-[560px] lg:rounded-[32px]"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(255,255,255,0.26),transparent_35%)]" />
            <div className="relative z-10">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-white/75 sm:tracking-[0.22em]">
                Servicio técnico
              </p>
              <h2 className="mt-4 text-3xl font-black leading-none tracking-[-0.045em] sm:text-4xl lg:tracking-[-0.07em]">
                Mantenimiento y reparación
              </h2>
              <p className="mt-5 text-sm font-semibold leading-7 text-white/80">
                Hornos, quemadores, tableros eléctricos, laminadoras y equipos de panadería.
              </p>
              <Btn href={wa("Hola Tecnova, quiero solicitar servicio técnico.")} dark>
                Solicitar servicio
              </Btn>
            </div>
            <Wrench className="absolute -bottom-12 -right-12 h-56 w-56 text-white/15 transition duration-700 group-hover:rotate-12 group-hover:scale-110 sm:h-72 sm:w-72" />
          </motion.article>

          <motion.article
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.16 }}
            className="group relative min-h-[270px] overflow-hidden rounded-[28px] bg-black text-white shadow-soft lg:rounded-[32px]"
          >
            <Img src="/products/horno-doble-industrial.jpg" alt="Quemadores" sizes="(max-width: 1024px) 100vw, 24vw" />
            <div className="absolute inset-0 bg-black/65" />
            <div className="absolute left-7 top-7 max-w-[240px]">
              <p className="text-xs font-black uppercase tracking-[0.22em] text-red-300">
                Quemadores
              </p>
              <h3 className="mt-3 text-3xl font-black leading-none tracking-[-0.05em]">
                Instalación y venta
              </h3>
              <a href={wa("Hola Tecnova, quiero consultar por quemadores.")} target="_blank" rel="noreferrer" className="mt-6 inline-flex items-center gap-2 text-sm font-black text-white">
                Consultar <ArrowRight size={16} />
              </a>
            </div>
          </motion.article>

          <motion.article
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.24 }}
            className="group relative min-h-[270px] overflow-hidden rounded-[28px] bg-neutral-100 p-6 shadow-soft sm:p-7 lg:rounded-[32px]"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white via-transparent to-red-50" />
            <div className="relative z-10">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-tecnova-red sm:tracking-[0.22em]">
                Repuestos
              </p>
              <h3 className="mt-3 text-2xl font-black leading-none tracking-[-0.04em] sm:text-3xl sm:tracking-[-0.05em]">
                Tableros, motores y controladores
              </h3>
              <a href={wa("Hola Tecnova, quiero consultar repuestos y tableros.")} target="_blank" rel="noreferrer" className="mt-6 inline-flex items-center gap-2 text-sm font-black text-tecnova-red">
                Ver disponibilidad <ArrowRight size={16} />
              </a>
            </div>
            <Settings className="absolute -bottom-10 -right-10 h-52 w-52 text-black/5 transition duration-700 group-hover:rotate-12 group-hover:scale-110" />
          </motion.article>
        </div>
      </section>

      <BrandLoop />

      <section id="catalogo" className="order-4 mx-auto max-w-[1540px] px-4 py-8 sm:px-5 lg:px-14">
        <div className="mb-7 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-tecnova-red sm:tracking-[0.22em]">
              Catálogo Tecnova
            </p>
            <h2 className="mt-2 text-3xl font-black tracking-[-0.045em] sm:text-4xl lg:text-6xl lg:tracking-[-0.06em]">
              Equipos disponibles
            </h2>
          </div>

          <div className="flex max-w-full flex-wrap gap-2">
            {categories.map((category) => (
              <motion.button
                key={category}
                onClick={() => setActiveCategory(category)}
                whileTap={{ scale: 0.96 }}
                className={`rounded-full px-4 py-2.5 text-sm font-black transition sm:px-5 ${
                  activeCategory === category
                    ? "bg-tecnova-red text-white"
                    : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                }`}
              >
                {category}
              </motion.button>
            ))}
          </div>
        </div>

        <motion.div layout className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map((product) => (
            <motion.article
              layout
              key={product.id}
              whileHover={{ y: -7 }}
              className="group flex h-full flex-col overflow-hidden rounded-[26px] bg-white shadow-soft ring-1 ring-black/5 transition hover:shadow-lift sm:rounded-[30px]"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-neutral-100">
                <Img src={product.image} alt={product.name} />
              </div>
              <div className="flex flex-1 flex-col p-5 sm:p-6">
                <p className="text-[11px] font-black uppercase tracking-[0.16em] text-tecnova-red sm:tracking-[0.22em]">
                  {product.category}
                </p>
                <h3 className="mt-2 text-xl font-black tracking-[-0.04em] sm:text-2xl sm:tracking-[-0.05em]">{product.name}</h3>
                <p className="mt-3 flex-1 text-sm font-semibold leading-6 text-tecnova-steel">
                  {product.description}
                </p>
                <a
                  href={wa(`Hola Tecnova, quiero cotizar: ${product.name}`)}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-5 flex items-center justify-between gap-3 rounded-2xl bg-black px-5 py-4 text-sm font-black text-white transition hover:bg-tecnova-red [&>svg]:shrink-0"
                >
                  Cotizar producto <ArrowRight size={17} />
                </a>
              </div>
            </motion.article>
          ))}
        </motion.div>
      </section>

      <section id="servicios" className="order-5 mx-auto max-w-[1540px] px-4 py-8 sm:px-5 lg:px-14">
        <div className="rounded-[28px] bg-neutral-100 p-5 sm:p-7 lg:rounded-[34px] lg:p-10">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-tecnova-red sm:tracking-[0.22em]">
            Servicios industriales
          </p>
          <h2 className="mt-2 text-3xl font-black tracking-[-0.045em] sm:text-4xl lg:text-6xl lg:tracking-[-0.06em]">
            Soporte para mantener tu producción activa
          </h2>

          <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {services.map(([Icon, title, text]) => (
              <motion.div
                key={title}
                whileHover={{ y: -6 }}
                className="group flex h-full flex-col rounded-[24px] bg-white p-5 shadow-sm ring-1 ring-black/5 transition hover:shadow-soft sm:rounded-[28px] sm:p-6"
              >
                <div className="grid h-14 w-14 place-items-center rounded-2xl bg-red-50 text-tecnova-red transition group-hover:bg-tecnova-red group-hover:text-white">
                  <Icon size={27} />
                </div>
                <h3 className="mt-5 text-xl font-black">{legacyText(title)}</h3>
                <p className="mt-2 text-sm font-semibold leading-6 text-tecnova-steel">{legacyText(text)}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="proyectos" className="order-6 mx-auto max-w-[1540px] px-4 py-8 sm:px-5 lg:px-14">
        <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="rounded-[28px] bg-black p-6 text-white shadow-soft sm:p-8 lg:rounded-[34px] lg:p-10">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-red-300 sm:tracking-[0.22em]">
              Proyectos reales
            </p>
            <h2 className="mt-3 text-3xl font-black leading-none tracking-[-0.045em] sm:text-4xl lg:tracking-[-0.06em]">
              Instalaciones, reparaciones y equipos entregados.
            </h2>
            <p className="mt-5 text-sm font-semibold leading-7 text-white/70">
              Trabajo técnico para panaderías, restaurantes e industria alimentaria.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-5">
            {typedProducts.slice(0, 4).map((product) => (
              <motion.div key={product.id} whileHover={{ y: -6 }} className="group relative aspect-[4/3] overflow-hidden rounded-[22px] bg-neutral-200 shadow-soft sm:rounded-[28px]">
                <Img src={product.image} alt={product.name} sizes="(max-width: 1024px) 50vw, 31vw" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="contacto" className="order-7 mx-auto max-w-[1540px] px-4 py-10 sm:px-5 lg:px-14">
        <div className="relative overflow-hidden rounded-[28px] bg-tecnova-red p-6 text-white shadow-lift sm:p-8 lg:rounded-[36px] lg:p-12">
          <Sparkles className="absolute -right-10 -top-10 h-44 w-44 text-white/10 sm:h-56 sm:w-56" />
          <div className="relative grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-white/70 sm:tracking-[0.22em]">
                Contacto
              </p>
              <h2 className="mt-3 text-3xl font-black leading-none tracking-[-0.045em] sm:text-4xl lg:text-6xl lg:tracking-[-0.06em]">
                Cotiza maquinaria, repuestos o servicio técnico.
              </h2>
            </div>

            <div className="space-y-3">
              <a href={wa("Hola Tecnova, quiero solicitar una cotización.")} target="_blank" rel="noreferrer" className="flex items-center justify-between rounded-3xl bg-white px-6 py-5 font-black text-black transition hover:bg-black hover:text-white">
                WhatsApp 937 492 227 <MessageCircle />
              </a>
              <a href="mailto:joseylverml20@gmail.com" className="flex items-center justify-between gap-3 break-all rounded-3xl border border-white/25 px-5 py-5 font-black text-white transition hover:bg-white/10 sm:px-6 [&>svg]:shrink-0">
                joseylverml20@gmail.com <ArrowRight />
              </a>
            </div>
          </div>
        </div>
      </section>

      <footer className="order-8 bg-neutral-100 px-4 py-12 sm:px-5 sm:py-14 lg:px-14">
        <div className="mx-auto max-w-[1540px]">
          <div className="grid gap-10 border-b border-neutral-200 pb-12 sm:grid-cols-2 lg:grid-cols-[1.3fr_0.8fr_0.8fr_1fr]">
            <div>
              <div className="relative h-16 w-[212px] max-w-full">
                <Image src="/logo.png" alt="Tecnova Perú" fill sizes="212px" className="object-contain object-left" />
              </div>
              <p className="mt-6 max-w-sm text-sm font-semibold leading-7 text-tecnova-steel">
                Soluciones industriales para panificación, automatización, venta de maquinaria, repuestos y servicio técnico especializado.
              </p>

              <div className="mt-6 space-y-3 text-sm font-bold text-tecnova-dark">
                <p className="flex items-center gap-3"><MessageCircle size={19} className="shrink-0" />937 492 227</p>
                <p className="flex items-center gap-3 break-all"><Mail size={19} className="shrink-0" />joseylverml20@gmail.com</p>
                <p className="flex items-center gap-3"><MapPin size={19} className="shrink-0" />San Juan de Lurigancho, Lima</p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-black uppercase tracking-[0.16em]">Empresa</h3>
              <div className="mt-6 space-y-4 text-sm font-semibold text-tecnova-steel">
                <a href="#catalogo" className="block hover:text-tecnova-red">Catálogo</a>
                <a href="#servicios" className="block hover:text-tecnova-red">Servicios</a>
                <a href="#proyectos" className="block hover:text-tecnova-red">Proyectos</a>
                <a href="#contacto" className="block hover:text-tecnova-red">Contacto</a>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-black uppercase tracking-[0.16em]">Servicios</h3>
              <div className="mt-6 space-y-4 text-sm font-semibold text-tecnova-steel">
                <p>Reparación de hornos</p>
                <p>Mantenimiento preventivo</p>
                <p>Automatización</p>
                <p>Venta de repuestos</p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-black uppercase tracking-[0.16em]">Síguenos</h3>
              <div className="mt-6 flex flex-wrap gap-3">
                {socials.map((social) => {
                  const Icon = social.icon;
                  return (
                    <a key={social.name} href={social.href} target="_blank" rel="noreferrer" aria-label={social.name} className="grid h-11 w-11 place-items-center rounded-full bg-white text-black shadow-sm transition hover:-translate-y-1 hover:bg-tecnova-red hover:text-white">
                      <Icon size={19} />
                    </a>
                  );
                })}
              </div>

              <a href={wa("Hola Tecnova, quiero solicitar información.")} target="_blank" rel="noreferrer" className="mt-7 flex items-center justify-between rounded-3xl bg-black px-5 py-4 text-sm font-black text-white transition hover:bg-tecnova-red">
                Cotizar por WhatsApp <ArrowRight size={17} />
              </a>
            </div>
          </div>

          <div className="mt-10 overflow-hidden rounded-[24px] bg-white shadow-soft ring-1 ring-black/5 sm:rounded-[30px]">
            <iframe
              title="Tecnova Perú ubicación"
              src="https://www.google.com/maps?q=San%20Juan%20de%20Lurigancho%2C%20Lima%2C%20Peru&output=embed"
              className="h-[330px] w-full border-0"
              loading="lazy"
            />
          </div>

          <div className="mt-8 flex flex-col justify-between gap-3 text-sm font-bold text-tecnova-steel lg:flex-row">
            <span>© 2026 Tecnova Perú. Todos los derechos reservados.</span>
            <span>Maquinaria industrial, servicio técnico y automatización.</span>
          </div>
        </div>
      </footer>

      <motion.a
        href={wa("Hola Tecnova, quiero solicitar información.")}
        target="_blank"
        rel="noreferrer"
        aria-label="Contactar por WhatsApp"
        whileHover={{ y: -3, scale: 1.05 }}
        whileTap={{ scale: 0.94 }}
        className="fixed bottom-3 right-4 z-50 grid h-12 w-12 place-items-center rounded-full bg-tecnova-red text-white shadow-lift sm:bottom-5 sm:right-5 sm:h-14 sm:w-14"
      >
        <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6" />
      </motion.a>
    </main>
  );
}

