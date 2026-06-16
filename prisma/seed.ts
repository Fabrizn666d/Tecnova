import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import slugify from "slugify";

const prisma = new PrismaClient();

const slug = (value: string) => slugify(value, { lower: true, strict: true, locale: "es" });
const json = (value: unknown) => JSON.stringify(value);

const spareCategorySlugs = [
  "motores",
  "motorreductores",
  "tableros",
  "controladores",
  "sensores",
  "resistencias",
  "termostatos",
  "variadores",
  "tarjetas-electronicas",
];

async function main() {
  await prisma.quoteItem.deleteMany();
  await prisma.quote.deleteMany();
  await prisma.lead.deleteMany();
  await prisma.complaint.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.service.deleteMany();
  await prisma.project.deleteMany();
  await prisma.banner.deleteMany();
  await prisma.brand.deleteMany();
  await prisma.fAQ.deleteMany();
  await prisma.testimonial.deleteMany();
  await prisma.setting.deleteMany();
  await prisma.activityLog.deleteMany();
  await prisma.loginAttempt.deleteMany();

  const categories = await Promise.all(
    [
      ["Hornos", "Flame", "Hornos industriales para panadería y pastelería"],
      ["Laminadoras", "Layers", "Laminadoras industriales para masas"],
      ["Quemadores", "Zap", "Quemadores industriales para hornos y calderas"],
      ["Batidoras", "Blend", "Batidoras industriales para producción diaria"],
      ["Cortadoras", "Scissors", "Cortadoras automáticas para masas de pan"],
      ["Equipos Industriales", "Factory", "Equipos para producción alimentaria"],
      ["Motores", "Cog", "Motores industriales para maquinaria"],
      ["Motorreductores", "Settings", "Motorreductores para líneas de producción"],
      ["Tableros", "PanelTop", "Tableros eléctricos y componentes"],
      ["Controladores", "Gauge", "Controladores digitales y automatización"],
      ["Sensores", "Radar", "Sensores industriales"],
      ["Resistencias", "Zap", "Resistencias para equipos térmicos"],
      ["Termostatos", "Thermometer", "Termostatos industriales"],
      ["Variadores", "SlidersHorizontal", "Variadores de velocidad"],
      ["Tarjetas Electrónicas", "CircuitBoard", "Tarjetas y módulos electrónicos"],
    ].map(([nombre, icono, descripcion], index) =>
      prisma.category.create({
        data: { nombre, slug: slug(nombre), icono, descripcion, orden: index + 1, activo: true },
      })
    )
  );

  const bySlug = Object.fromEntries(categories.map((category) => [category.slug, category]));

  const productImages = [
    "/products/horno-industrial-frontal.jpg",
    "/products/horno-doble-industrial.jpg",
    "/products/horno-modular-varias-camaras.jpg",
    "/products/laminadora-industrial-metalica.jpg",
    "/products/laminadora-masa-blanca.jpg",
    "/products/laminadora-sobre-pallet.jpg",
  ];

  const products = [
    ["Horno industrial premium", "hornos", "Equipo industrial de alta eficiencia para panadería, restaurantes y producción alimentaria.", "Nova", "HE-300", productImages[0]],
    ["Horno doble industrial", "hornos", "Horno de doble cámara con controles independientes para alta producción.", "Nova", "HD-200", productImages[1]],
    ["Horno modular de varias cámaras", "hornos", "Sistema modular para panificación con capacidad escalable y control técnico.", "FM", "HM-4C", productImages[2]],
    ["Horno rotativo panadero", "hornos", "Horno rotativo para bandejas con cocción uniforme y bajo consumo.", "Nova", "HR-18", productImages[0]],
    ["Horno convector FM", "hornos", "Equipo convector para panadería fina, pastelería y producción constante.", "FM", "CV-10", productImages[1]],
    ["Laminadora industrial metálica", "laminadoras", "Equipo robusto para procesos continuos de panadería y pastelería.", "Malquipan", "LM-500", productImages[3]],
    ["Laminadora de masa blanca", "laminadoras", "Laminadora compacta para producción diaria de masas.", "Malquipan", "LM-300", productImages[4]],
    ["Laminadora sobre pallet", "laminadoras", "Laminadora industrial lista para despacho, montaje e instalación.", "Malquipan", "LP-700", productImages[5]],
    ["Laminadora de mesa", "laminadoras", "Solución compacta para obradores, cafeterías y panaderías pequeñas.", "Nova", "LMT-80", productImages[4]],
    ["Quemador Beckett", "quemadores", "Quemador industrial confiable para hornos de panadería y calderas.", "Beckett", "AFG", productImages[1]],
    ["Quemador Wayne", "quemadores", "Quemador de bajo consumo para procesos térmicos exigentes.", "Wayne", "HS", productImages[1]],
    ["Quemador Riello", "quemadores", "Quemador de alto rendimiento para hornos industriales.", "Riello", "40G", productImages[2]],
    ["Quemador Nova", "quemadores", "Quemador compatible con diferentes cámaras y sistemas de control.", "Nova", "QN-20", productImages[2]],
    ["Tablero eléctrico industrial", "tableros", "Tablero eléctrico armado para hornos, laminadoras y maquinaria.", "Schneider", "TE-01", productImages[0]],
    ["Motor reductor", "motorreductores", "Motor reductor para mantenimiento y reparación de líneas de producción.", "Siemens", "MR-2HP", productImages[3]],
    ["Controlador digital", "controladores", "Controlador para temperatura, ciclos y automatización de hornos.", "Honeywell", "CD-900", productImages[0]],
    ["Resistencia eléctrica", "resistencias", "Resistencia para recambio técnico y mantenimiento preventivo.", "Danfoss", "RE-220", productImages[2]],
    ["Termostato industrial", "termostatos", "Termostato para control seguro de temperatura en equipos térmicos.", "Honeywell", "TI-400", productImages[1]],
    ["Batidora espiral 20L", "batidoras", "Batidora espiral para masas con estructura robusta.", "Nova", "BE-20", productImages[3]],
    ["Batidora espiral 50L", "batidoras", "Batidora de alta capacidad para producción continua.", "Nova", "BE-50", productImages[4]],
    ["Cortadora automática para pan", "cortadoras", "Cortadora para porcionado uniforme y operación diaria.", "Malquipan", "CAP-36", productImages[5]],
  ];

  await Promise.all(
    products.map(([nombre, categorySlug, descripcionCorta, marca, modelo, imagen], index) => {
      const tipo = spareCategorySlugs.includes(categorySlug) ? "repuesto" : "producto";

      return prisma.product.create({
        data: {
          tipo,
          nombre,
          slug: slug(nombre),
          subtitulo: `${marca} ${modelo}`,
          descripcionCorta,
          descripcionLarga: `${descripcionCorta} Incluye asesoría técnica, instalación y soporte postventa según requerimiento del cliente.`,
          categoryId: bySlug[categorySlug].id,
          marca,
          modelo,
          codigoRef: `TEC-${String(index + 1).padStart(3, "0")}`,
          condicion: "nuevo",
          imagenPrincipal: imagen,
          imagenes: json([imagen]),
          especificaciones: json([
            { clave: "Marca", valor: marca },
            { clave: "Modelo", valor: modelo },
            { clave: "Uso", valor: "Panadería e industria alimentaria" },
            { clave: "Instalación", valor: "Disponible en Lima y provincias" },
            { clave: "Garantía", valor: "Según evaluación técnica" },
          ]),
          caracteristicas: json([
            "Construcción robusta para trabajo continuo",
            "Soporte técnico especializado",
            "Componentes de fácil mantenimiento",
            "Cotización directa por WhatsApp",
          ]),
          aplicaciones: json(["Panaderías", "Restaurantes", "Industria alimentaria", "Mantenimiento industrial"]),
          tags: json([nombre, marca, modelo, categorySlug]),
          destacado: tipo === "producto" && index < 8,
          ordenDestacado: tipo === "producto" ? index + 1 : null,
          destacadoRepuesto: tipo === "repuesto",
          ordenRepuesto: tipo === "repuesto" ? index + 1 : null,
          nuevo: index % 5 === 0,
          disponible: true,
          etiquetaPrecio: "Consultar precio",
          seoTitulo: `${nombre} | Tecnova Perú`,
          seoDesc: descripcionCorta,
        },
      });
    })
  );

  await prisma.service.createMany({
    data: [
      { nombre: "Reparación", slug: "reparacion", descripcion: "Diagnóstico y solución de fallas en maquinaria industrial", caracteristicas: json(["Diagnóstico técnico", "Reparación eléctrica y mecánica", "Pruebas de operación"]), icono: "Wrench", orden: 1 },
      { nombre: "Mantenimiento", slug: "mantenimiento", descripcion: "Mantenimiento preventivo y correctivo", caracteristicas: json(["Plan preventivo", "Cambio de componentes", "Informe técnico"]), icono: "ShieldCheck", orden: 2 },
      { nombre: "Automatización", slug: "automatizacion", descripcion: "Instalación de controladores, tableros y mejoras eléctricas", caracteristicas: json(["Tableros de control", "Sensores y variadores", "Mejoras de seguridad"]), icono: "Zap", orden: 3 },
      { nombre: "Instalación", slug: "instalacion", descripcion: "Instalación y puesta en marcha de maquinaria nueva", caracteristicas: json(["Montaje", "Puesta en marcha", "Capacitación inicial"]), icono: "Package", orden: 4 },
    ],
  });

  await prisma.brand.createMany({
    data: ["Beckett", "Riello", "Nova", "Honeywell", "Schneider", "Siemens", "Danfoss", "Wayne", "Malquipan", "FM"].map((nombre, orden) => ({
      nombre,
      orden,
      activo: true,
    })),
  });

  await prisma.banner.createMany({
    data: [
      {
        titulo: "Hornos para producción real",
        subtitulo: "Equipos industriales",
        descripcion: "Venta, instalación, mantenimiento y reparación de maquinaria para panificación e industria.",
        ctaTexto: "Ver productos",
        ctaLink: "/productos",
        ctaTipo: "catalogo",
        ctaTexto2: "Ver repuestos",
        ctaLink2: "/repuestos",
        imagenDesktop: "/hero-tecnova-industrial.png",
        imagenMobile: "/hero-tecnova-industrial.png",
        orden: 1,
      },
    ],
  });

  await prisma.project.createMany({
    data: [
      { titulo: "Instalación de horno modular", slug: "instalacion-horno-modular", descripcion: "Entrega e instalación para panadería de alto volumen.", categoria: "Instalación", ubicacion: "Lima", destacado: true, imagenes: json([productImages[2]]), orden: 1 },
      { titulo: "Reparación de tablero eléctrico", slug: "reparacion-tablero-electrico", descripcion: "Diagnóstico y corrección de fallas de control.", categoria: "Reparación", ubicacion: "San Juan de Lurigancho", destacado: true, imagenes: json([productImages[0]]), orden: 2 },
      { titulo: "Mantenimiento de laminadora", slug: "mantenimiento-laminadora", descripcion: "Servicio preventivo para continuidad operativa.", categoria: "Mantenimiento", ubicacion: "Lima", destacado: true, imagenes: json([productImages[3]]), orden: 3 },
    ],
  });

  await prisma.testimonial.createMany({
    data: [
      { nombre: "Panadería San Miguel", empresa: "Cliente industrial", mensaje: "Tecnova nos ayudó a recuperar producción el mismo día.", rating: 5, orden: 1 },
      { nombre: "Restaurante La Mesa", empresa: "Restaurante", mensaje: "La instalación fue ordenada y el equipo quedó funcionando perfecto.", rating: 5, orden: 2 },
      { nombre: "Pastelería Dulce Horno", empresa: "Pastelería", mensaje: "Muy buena asesoría para elegir maquinaria.", rating: 5, orden: 3 },
    ],
  });

  await prisma.fAQ.createMany({
    data: [
      { pregunta: "¿Realizan instalación?", respuesta: "Sí, coordinamos instalación y puesta en marcha según el equipo y ubicación.", categoria: "servicio", orden: 1 },
      { pregunta: "¿Venden repuestos?", respuesta: "Sí, trabajamos tableros, motores, controladores, quemadores y componentes eléctricos.", categoria: "productos", orden: 2 },
      { pregunta: "¿Atienden fuera de Lima?", respuesta: "Sí, previa coordinación técnica y logística.", categoria: "general", orden: 3 },
    ],
  });

  await prisma.setting.createMany({
    data: [
      { clave: "empresa_nombre", valor: "Tecnova Perú", grupo: "general", label: "Nombre de la empresa" },
      { clave: "razon_social", valor: "Tecnova Perú", grupo: "legal", label: "Razón social" },
      { clave: "ruc", valor: "Por actualizar", grupo: "legal", label: "RUC" },
      { clave: "telefono", valor: "937 492 227", grupo: "contacto", label: "Teléfono" },
      { clave: "whatsapp", valor: "51937492227", grupo: "contacto", label: "WhatsApp" },
      { clave: "whatsapp_display", valor: "937 492 227", grupo: "contacto", label: "WhatsApp visible" },
      { clave: "email", valor: "jose.ylver.martinez18@gmail.com", grupo: "contacto", label: "Email" },
      { clave: "direccion", valor: "San Juan de Lurigancho, Lima, Perú", grupo: "contacto", label: "Dirección" },
      { clave: "horario", valor: "Lunes a sábado de 8:00 a.m. a 6:00 p.m.", grupo: "contacto", label: "Horario" },
      { clave: "logo_principal", valor: "/logo.png", grupo: "visual", label: "Logo principal" },
      { clave: "logo_footer", valor: "/logo.png", grupo: "visual", label: "Logo footer" },
      { clave: "favicon", valor: "/favicon.ico", grupo: "visual", label: "Favicon" },
      { clave: "seo_titulo", valor: "Tecnova Perú | Maquinaria industrial", grupo: "seo", label: "SEO título" },
      { clave: "seo_descripcion", valor: "Venta de maquinaria, repuestos y servicios técnicos para panificación e industria alimentaria.", grupo: "seo", label: "SEO descripción" },
      { clave: "copyright_texto", valor: "© 2026 Tecnova Perú. Todos los derechos reservados.", grupo: "footer", label: "Copyright" },
      { clave: "designer_texto", valor: "Diseñado y desarrollado por Fabrizio Apaza", grupo: "footer", label: "Diseñador" },
      { clave: "mensaje_whatsapp", valor: "Hola Tecnova, me gustaría recibir más información sobre sus equipos y servicios.", grupo: "whatsapp", label: "Mensaje predeterminado" },
    ],
  });

  await prisma.adminUser.upsert({
    where: { email: "admin@tecnovaperu.com" },
    update: {},
    create: {
      nombre: "Administrador Tecnova",
      email: "admin@tecnovaperu.com",
      password: await bcrypt.hash("Tecnova2026!", 12),
      rol: "SUPER_ADMIN",
      activo: true,
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log("Seed Tecnova completado. Admin: admin@tecnovaperu.com / Tecnova2026!");
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
