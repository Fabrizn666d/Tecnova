import { cleanOptionalText, cleanSlug, cleanText, safeJson } from "@/lib/sanitize";

type RecordData = Record<string, unknown>;

export type ResourceName =
  | "productos"
  | "repuestos"
  | "categorias"
  | "servicios"
  | "proyectos"
  | "banners"
  | "marcas"
  | "cotizaciones"
  | "testimonios"
  | "faqs"
  | "usuarios"
  | "configuracion"
  | "leads"
  | "reclamaciones";

export type Delegate = {
  findMany(args?: RecordData): Promise<unknown[]>;
  findUnique(args: RecordData): Promise<unknown>;
  count(args?: RecordData): Promise<number>;
  create(args: { data: RecordData }): Promise<unknown>;
  update(args: { where: RecordData; data: RecordData }): Promise<unknown>;
  delete(args: { where: RecordData }): Promise<unknown>;
  upsert?(args: RecordData): Promise<unknown>;
};

export const resourceModel: Record<ResourceName, string> = {
  productos: "product",
  repuestos: "product",
  categorias: "category",
  servicios: "service",
  proyectos: "project",
  banners: "banner",
  marcas: "brand",
  cotizaciones: "quote",
  testimonios: "testimonial",
  faqs: "fAQ",
  usuarios: "adminUser",
  configuracion: "setting",
  leads: "lead",
  reclamaciones: "complaint",
};

export function modelDelegate(prisma: unknown, resource: ResourceName) {
  return (prisma as Record<string, Delegate>)[resourceModel[resource]];
}

export function toBool(value: unknown, fallback = false) {
  if (typeof value === "boolean") return value;
  if (value === "true") return true;
  if (value === "false") return false;
  return fallback;
}

export function toInt(value: unknown, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

export function toFloat(value: unknown) {
  if (value === "" || value === null || typeof value === "undefined") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

export function buildResourceData(resource: ResourceName, input: RecordData) {
  switch (resource) {
    case "categorias":
      return {
        nombre: cleanText(input.nombre, 120),
        slug: cleanSlug(cleanText(input.slug || input.nombre, 120)),
        descripcion: cleanOptionalText(input.descripcion, 500),
        icono: cleanOptionalText(input.icono, 60),
        imagen: cleanOptionalText(input.imagen, 250),
        color: cleanOptionalText(input.color, 20),
        orden: toInt(input.orden),
        activo: toBool(input.activo, true),
      };
    case "productos":
    case "repuestos": {
      const defaultTipo = resource === "repuestos" ? "repuesto" : "producto";
      return {
        tipo: cleanText(input.tipo || defaultTipo, 30),
        nombre: cleanText(input.nombre, 160),
        slug: cleanSlug(cleanText(input.slug || input.nombre, 160)),
        subtitulo: cleanOptionalText(input.subtitulo, 160),
        descripcionCorta: cleanText(input.descripcionCorta, 500),
        descripcionLarga: cleanOptionalText(input.descripcionLarga, 5000),
        categoryId: cleanText(input.categoryId, 80),
        marca: cleanOptionalText(input.marca, 120),
        modelo: cleanOptionalText(input.modelo, 120),
        codigoRef: cleanOptionalText(input.codigoRef, 80),
        condicion: cleanText(input.condicion || "nuevo", 30),
        precio: toFloat(input.precio),
        precioAnterior: toFloat(input.precioAnterior),
        mostrarPrecio: toBool(input.mostrarPrecio),
        etiquetaPrecio: cleanOptionalText(input.etiquetaPrecio, 80),
        imagenes: safeJson(input.imagenes),
        imagenPrincipal: cleanOptionalText(input.imagenPrincipal, 250),
        especificaciones: safeJson(input.especificaciones),
        caracteristicas: safeJson(input.caracteristicas),
        aplicaciones: safeJson(input.aplicaciones),
        compatibilidad: safeJson(input.compatibilidad),
        archivos: safeJson(input.archivos),
        activo: toBool(input.activo, true),
        destacado: toBool(input.destacado),
        ordenDestacado: input.ordenDestacado === "" ? null : toInt(input.ordenDestacado, 0),
        destacadoRepuesto: resource === "repuestos" ? toBool(input.destacadoRepuesto, true) : toBool(input.destacadoRepuesto),
        ordenRepuesto: input.ordenRepuesto === "" ? null : toInt(input.ordenRepuesto, 0),
        nuevo: toBool(input.nuevo),
        disponible: toBool(input.disponible, true),
        etiqueta: cleanOptionalText(input.etiqueta, 80),
        seoTitulo: cleanOptionalText(input.seoTitulo, 180),
        seoDesc: cleanOptionalText(input.seoDesc, 260),
        tags: safeJson(input.tags),
      };
    }
    case "servicios":
      return {
        nombre: cleanText(input.nombre, 120),
        slug: cleanSlug(cleanText(input.slug || input.nombre, 120)),
        descripcion: cleanText(input.descripcion, 500),
        descripcionLarga: cleanOptionalText(input.descripcionLarga, 5000),
        icono: cleanOptionalText(input.icono, 60),
        imagen: cleanOptionalText(input.imagen, 250),
        caracteristicas: safeJson(input.caracteristicas),
        orden: toInt(input.orden),
        activo: toBool(input.activo, true),
      };
    case "proyectos":
      return {
        titulo: cleanText(input.titulo, 160),
        slug: cleanSlug(cleanText(input.slug || input.titulo, 160)),
        descripcion: cleanOptionalText(input.descripcion, 1200),
        cliente: cleanOptionalText(input.cliente, 160),
        ubicacion: cleanOptionalText(input.ubicacion, 160),
        fecha: input.fecha ? new Date(String(input.fecha)) : null,
        imagenes: safeJson(input.imagenes),
        categoria: cleanOptionalText(input.categoria, 80),
        destacado: toBool(input.destacado),
        activo: toBool(input.activo, true),
        orden: toInt(input.orden),
      };
    case "banners":
      return {
        titulo: cleanText(input.titulo, 180),
        subtitulo: cleanOptionalText(input.subtitulo, 160),
        descripcion: cleanOptionalText(input.descripcion, 300),
        ctaTexto: cleanOptionalText(input.ctaTexto, 80),
        ctaLink: cleanOptionalText(input.ctaLink, 250),
        ctaTipo: cleanText(input.ctaTipo || "link", 30),
        ctaTexto2: cleanOptionalText(input.ctaTexto2, 80),
        ctaLink2: cleanOptionalText(input.ctaLink2, 250),
        imagenDesktop: cleanOptionalText(input.imagenDesktop, 250),
        imagenMobile: cleanOptionalText(input.imagenMobile, 250),
        colorTexto: cleanText(input.colorTexto || "light", 20),
        overlay: toBool(input.overlay, true),
        overlayOpacity: toFloat(input.overlayOpacity) ?? 0.5,
        posicion: cleanText(input.posicion || "hero", 40),
        activo: toBool(input.activo, true),
        orden: toInt(input.orden),
        fechaInicio: input.fechaInicio ? new Date(String(input.fechaInicio)) : null,
        fechaFin: input.fechaFin ? new Date(String(input.fechaFin)) : null,
      };
    case "marcas":
      return {
        nombre: cleanText(input.nombre, 120),
        logo: cleanOptionalText(input.logo, 250),
        url: cleanOptionalText(input.url, 250),
        orden: toInt(input.orden),
        activo: toBool(input.activo, true),
      };
    case "cotizaciones":
      return {
        nombre: cleanOptionalText(input.nombre, 120),
        telefono: cleanOptionalText(input.telefono, 60),
        email: cleanOptionalText(input.email, 160),
        mensaje: cleanOptionalText(input.mensaje, 1200),
        fuente: cleanText(input.fuente || "whatsapp", 40),
        estado: cleanText(input.estado || "nuevo", 40),
        notas: cleanOptionalText(input.notas, 2000),
      };
    case "testimonios":
      return {
        nombre: cleanText(input.nombre, 120),
        empresa: cleanOptionalText(input.empresa, 120),
        cargo: cleanOptionalText(input.cargo, 120),
        mensaje: cleanText(input.mensaje, 500),
        rating: Math.min(Math.max(toInt(input.rating, 5), 1), 5),
        imagen: cleanOptionalText(input.imagen, 250),
        activo: toBool(input.activo, true),
        orden: toInt(input.orden),
      };
    case "faqs":
      return {
        pregunta: cleanText(input.pregunta, 250),
        respuesta: cleanText(input.respuesta, 2000),
        categoria: cleanOptionalText(input.categoria, 80),
        orden: toInt(input.orden),
        activo: toBool(input.activo, true),
      };
    case "usuarios":
      return {
        nombre: cleanText(input.nombre, 120),
        email: cleanText(input.email, 160).toLowerCase(),
        rol: normalizeRole(input.rol),
        activo: toBool(input.activo, true),
      };
    case "configuracion":
      return {
        clave: cleanText(input.clave, 120),
        valor: cleanText(input.valor, 2000),
        tipo: cleanText(input.tipo || "string", 30),
        grupo: cleanText(input.grupo || "general", 80),
        label: cleanOptionalText(input.label, 160),
      };
    case "leads":
      return {
        nombre: cleanOptionalText(input.nombre, 120),
        telefono: cleanOptionalText(input.telefono, 60),
        email: cleanOptionalText(input.email, 160),
        consulta: cleanText(input.consulta || input.mensaje, 2000),
        fuente: cleanText(input.fuente || "contacto", 40),
        estado: cleanText(input.estado || "nuevo", 40),
        notas: cleanOptionalText(input.notas, 2000),
      };
    case "reclamaciones":
      return {
        nombre: cleanText(input.nombre, 120),
        documento: cleanText(input.documento, 40),
        telefono: cleanOptionalText(input.telefono, 60),
        email: cleanOptionalText(input.email, 160),
        direccion: cleanOptionalText(input.direccion, 220),
        tipo: cleanText(input.tipo || "reclamo", 40),
        productoServicio: cleanOptionalText(input.productoServicio, 180),
        monto: toFloat(input.monto),
        detalle: cleanText(input.detalle, 3000),
        pedido: cleanText(input.pedido, 2000),
        estado: cleanText(input.estado || "nuevo", 40),
        notas: cleanOptionalText(input.notas, 2000),
      };
  }
}

function normalizeRole(value: unknown) {
  const role = cleanText(value || "ADMIN", 30).toUpperCase().replace(/-/g, "_");
  if (role === "SUPERADMIN" || role === "SUPER_ADMIN") return "SUPER_ADMIN";
  if (role === "EDITOR") return "EDITOR";
  return "ADMIN";
}
