import { PrismaClient } from "@prisma/client";
import slugify from "slugify";

const prisma = new PrismaClient();

const slug = (value: string) => slugify(value, { lower: true, strict: true, locale: "es" });
const json = (value: unknown) => JSON.stringify(value);

const categories = [
  ["Hornos", "Hornos industriales para panadería, pastelería y producción alimentaria."],
  ["Batidoras", "Batidoras industriales para masas, mezclas y producción diaria."],
  ["Laminadoras", "Laminadoras para masas de panadería, hojaldre y pastelería."],
  ["Amasadoras", "Amasadoras industriales para preparación de masas."],
  ["Prensas", "Prensas para formado de masas y pizzas."],
  ["Rebanadoras", "Rebanadoras de pan para operación comercial."],
  ["Divisoras", "Divisoras de masa para porcionado uniforme."],
] as const;

const imageByCategory: Record<string, string> = {
  Hornos: "/products/horno-industrial-frontal.jpg",
  Batidoras: "/products/laminadora-masa-blanca.jpg",
  Laminadoras: "/products/laminadora-industrial-metalica.jpg",
  Amasadoras: "/products/laminadora-sobre-pallet.jpg",
  Prensas: "/products/laminadora-masa-blanca.jpg",
  Rebanadoras: "/products/horno-modular-varias-camaras.jpg",
  Divisoras: "/products/horno-doble-industrial.jpg",
};

const products = [
  ["Horno 10 bandejas", "Hornos", 12900],
  ["Horno 5 bandejas con cámara de fermentación", "Hornos", 12000],
  ["Horno 5 bandejas", "Hornos", 7500],
  ["Batidora TN7", "Batidoras", 1400],
  ["Horno multifuncional de piedras 1 cabina", "Hornos", 5500],
  ["Horno multifuncional de piedras 2 cabinas", "Hornos", 9500],
  ["Horno de piso 3 cabinas T-HP6", "Hornos", 14400],
  ["Horno eléctrico convector Perspective", "Hornos", 3200],
  ["Horno eléctrico convector digital", "Hornos", 3800],
  ["Laminadora sobremesa", "Laminadoras", 13000],
  ["Laminadora pedestal", "Laminadoras", 14800],
  ["Mini laminadora TN350", "Laminadoras", 8900],
  ["Prensa de masas para pizzas", "Prensas", 3000],
  ["Amasadora 12 kg", "Amasadoras", 3300],
  ["Amasadora 20 kg", "Amasadoras", 4900],
  ["Prensa de masas 300", "Prensas", 3000],
  ["Divisora de masas automática 36 piezas", "Divisoras", 4900],
  ["Rebanadora de pan 31 piezas", "Rebanadoras", 2200],
  ["Horno rotativo 18 bandejas", "Hornos", 39000],
  ["Horno rotativo 15 bandejas", "Hornos", 35000],
  ["Horno rotativo 12 bandejas", "Hornos", 29000],
] as const;

async function main() {
  const categoryRows = await Promise.all(
    categories.map(([nombre, descripcion], index) =>
      prisma.category.upsert({
        where: { slug: slug(nombre) },
        update: { nombre, descripcion, activo: true },
        create: {
          nombre,
          slug: slug(nombre),
          descripcion,
          icono: nombre === "Hornos" ? "Flame" : nombre === "Laminadoras" ? "Layers" : "Factory",
          orden: 30 + index,
          activo: true,
        },
      })
    )
  );
  const byName = Object.fromEntries(categoryRows.map((category) => [category.nombre, category]));

  for (const [nombre, categoria, precio] of products) {
    const image = imageByCategory[categoria] || "/hero-tecnova-industrial.png";
    const descripcionCorta = `${nombre} para uso comercial e industrial, disponible para cotización y entrega según coordinación.`;
    await prisma.product.upsert({
      where: { slug: slug(nombre) },
      update: {
        nombre,
        categoryId: byName[categoria].id,
        descripcionCorta,
        descripcionLarga: `${descripcionCorta} Equipo recomendado para panaderías, pastelerías, restaurantes y negocios de producción alimentaria que requieren operación constante y soporte técnico.`,
        precio,
        mostrarPrecio: true,
        etiquetaPrecio: "PEN",
        activo: true,
        disponible: true,
      },
      create: {
        tipo: "producto",
        nombre,
        slug: slug(nombre),
        descripcionCorta,
        descripcionLarga: `${descripcionCorta} Equipo recomendado para panaderías, pastelerías, restaurantes y negocios de producción alimentaria que requieren operación constante y soporte técnico.`,
        categoryId: byName[categoria].id,
        marca: "Tecnova",
        modelo: nombre.match(/TN7|TN350|T-HP6/)?.[0] || null,
        condicion: "nuevo",
        precio,
        mostrarPrecio: true,
        etiquetaPrecio: "PEN",
        imagenPrincipal: image,
        imagenes: json([image]),
        especificaciones: json([
          { clave: "Categoría", valor: categoria },
          { clave: "Condición", valor: "Nuevo" },
          { clave: "Precio referencial", valor: `S/ ${precio.toLocaleString("es-PE")}` },
          { clave: "Uso recomendado", valor: "Producción comercial e industrial" },
        ]),
        caracteristicas: json([
          "Equipo para trabajo continuo",
          "Precio visible en catálogo",
          "Disponible para cotización",
          "Soporte técnico Tecnova",
        ]),
        aplicaciones: json(["Panaderías", "Pastelerías", "Restaurantes", "Producción alimentaria"]),
        tags: json([nombre, categoria, "Tecnova"]),
        activo: true,
        disponible: true,
        destacado: categoria === "Hornos",
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log(`Catálogo inicial cargado: ${products.length} productos.`);
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
