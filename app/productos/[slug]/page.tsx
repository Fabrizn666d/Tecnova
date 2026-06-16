import ProductActions from "@/components/ProductActions";
import ProductCard from "@/components/ProductCard";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { formatPrice } from "@/lib/format";
import { parseJsonArray, productImage, toCatalogCard, type SpecItem } from "@/lib/catalog";
import { prisma } from "@/lib/prisma";
import { getSettingsMap } from "@/lib/settings";
import type { Prisma } from "@prisma/client";
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ slug: string }>;
};

type ProductWithCategory = Prisma.ProductGetPayload<{ include: { category: true } }>;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await prisma.product.findFirst({ where: { slug, activo: true, tipo: "producto" } });
  if (!product) return { title: "Producto no encontrado | Tecnova Perú" };
  return {
    title: product.seoTitulo || `${product.nombre} | Tecnova Perú`,
    description: product.seoDesc || product.descripcionCorta,
    openGraph: {
      title: product.seoTitulo || product.nombre,
      description: product.seoDesc || product.descripcionCorta,
      images: product.imagenPrincipal ? [product.imagenPrincipal] : undefined,
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const settings = await getSettingsMap();
  const product = await prisma.product.findFirst({
    where: { slug, activo: true, tipo: "producto" },
    include: { category: true },
  });
  if (!product) notFound();

  const related = await prisma.product.findMany({
    where: { activo: true, tipo: "producto", categoryId: product.categoryId, id: { not: product.id } },
    include: { category: true },
    take: 3,
  });

  return (
    <main className="min-h-screen bg-white text-tecnova-dark">
      <SiteHeader whatsapp={settings.whatsapp} whatsappDisplay={settings.whatsapp_display} />
      <ProductDetail product={product} related={related} whatsapp={settings.whatsapp} />
      <SiteFooter settings={settings} />
    </main>
  );
}

function ProductDetail({
  product,
  related,
  whatsapp,
}: {
  product: ProductWithCategory;
  related: ProductWithCategory[];
  whatsapp: string;
}) {
  const images = [productImage(product), ...parseJsonArray<string>(product.imagenes)].filter(Boolean);
  const uniqueImages = Array.from(new Set(images));
  const specs = parseJsonArray<SpecItem>(product.especificaciones);
  const features = parseJsonArray<string>(product.caracteristicas);
  const applications = parseJsonArray<string>(product.aplicaciones);
  const card = toCatalogCard(product);

  return (
    <section className="mx-auto max-w-[1540px] px-4 py-8 sm:px-5 lg:px-14">
      <div className="grid gap-7 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="grid gap-4">
          <div className="relative aspect-[4/3] overflow-hidden rounded-[30px] bg-neutral-100 shadow-soft">
            <Image src={uniqueImages[0]} alt={product.nombre} fill priority sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
          </div>
          {uniqueImages.length > 1 && (
            <div className="grid grid-cols-4 gap-3">
              {uniqueImages.slice(0, 4).map((image) => (
                <div key={image} className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-neutral-100">
                  <Image src={image} alt={product.nombre} fill sizes="160px" className="object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        <aside className="rounded-[30px] bg-white p-6 shadow-soft ring-1 ring-black/5 sm:p-8 lg:sticky lg:top-24 lg:self-start">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-tecnova-red">{product.category.nombre}</p>
          <h1 className="mt-3 text-4xl font-black leading-none tracking-[-0.055em] sm:text-6xl">{product.nombre}</h1>
          <p className="mt-4 text-base font-semibold leading-7 text-tecnova-steel">{product.descripcionCorta}</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <Info label="Marca" value={product.marca || "Tecnova"} />
            <Info label="Modelo" value={product.modelo || "Consultar"} />
            <Info label="Disponibilidad" value={product.disponible ? "Disponible" : "Consultar"} />
            <Info label="Precio" value={formatPrice(product.precio, product.mostrarPrecio, product.etiquetaPrecio)} />
          </div>
          <div className="mt-6">
            <ProductActions item={card} whatsapp={whatsapp} />
          </div>
        </aside>
      </div>

      <div className="mt-10 grid gap-5 lg:grid-cols-[1fr_0.75fr]">
        <section className="rounded-[28px] bg-neutral-100 p-6 sm:p-8">
          <h2 className="text-3xl font-black">Descripción completa</h2>
          <p className="mt-4 text-sm font-semibold leading-7 text-tecnova-steel">{product.descripcionLarga || product.descripcionCorta}</p>
          {features.length > 0 && (
            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              {features.map((feature) => (
                <p key={feature} className="rounded-2xl bg-white px-4 py-3 text-sm font-bold text-neutral-700 shadow-sm ring-1 ring-black/5">{feature}</p>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-[28px] bg-white p-6 shadow-soft ring-1 ring-black/5 sm:p-8">
          <h2 className="text-3xl font-black">Características técnicas</h2>
          <div className="mt-5 divide-y divide-neutral-100">
            {specs.map((spec) => (
              <div key={`${spec.clave}-${spec.valor}`} className="flex justify-between gap-4 py-3 text-sm">
                <span className="font-bold text-tecnova-steel">{spec.clave}</span>
                <span className="text-right font-black">{spec.valor}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      {applications.length > 0 && (
        <section className="mt-5 rounded-[28px] bg-black p-6 text-white shadow-lift sm:p-8">
          <h2 className="text-3xl font-black">Aplicaciones</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {applications.map((item) => (
              <p key={item} className="rounded-2xl bg-white/10 px-4 py-3 text-sm font-black text-white">{item}</p>
            ))}
          </div>
        </section>
      )}

      {related.length > 0 && (
        <section className="mt-10">
          <h2 className="text-3xl font-black tracking-[-0.05em] sm:text-5xl">Productos relacionados</h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((item) => (
              <ProductCard key={item.id} item={toCatalogCard(item)} />
            ))}
          </div>
        </section>
      )}
    </section>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-neutral-100 px-4 py-3">
      <p className="text-[11px] font-black uppercase tracking-[0.14em] text-neutral-500">{label}</p>
      <p className="mt-1 font-black">{value}</p>
    </div>
  );
}
