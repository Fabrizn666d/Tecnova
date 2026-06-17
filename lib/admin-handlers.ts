import { isSuperAdmin, requireAdmin } from "@/lib/auth";
import { fail, ok, parsePagination, readJson } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { buildResourceData, modelDelegate, type ResourceName } from "@/lib/resources";
import bcrypt from "bcryptjs";
import type { NextRequest } from "next/server";

type RouteParams = { params: Promise<{ id: string }> };

export async function listAdmin(request: NextRequest, resource: ResourceName) {
  try {
    const admin = await requireAdmin();
    if (resource === "usuarios" && !isSuperAdmin(admin.rol)) {
      return fail("Solo superadmin puede gestionar usuarios.", 403);
    }

    const { searchParams } = request.nextUrl;
    const { pagina, limite, skip } = parsePagination(searchParams);
    const q = searchParams.get("q")?.trim();
    const delegate = modelDelegate(prisma, resource);
    const where = buildSearchWhere(resource, q);
    if (resource === "usuarios") {
      const [items, total] = await Promise.all([
        prisma.adminUser.findMany({
          where,
          skip,
          take: limite,
          orderBy: { createdAt: "desc" as const },
          select: adminUserSelect,
        }),
        prisma.adminUser.count({ where }),
      ]);
      return ok({ items, total, pagina, limite });
    }

    const [items, total] = await Promise.all([
      delegate.findMany({
        where,
        skip,
        take: limite,
        orderBy: buildOrder(resource),
        include: ["productos", "repuestos"].includes(resource) ? { category: true } : undefined,
      }),
      delegate.count({ where }),
    ]);
    return ok({ items, total, pagina, limite });
  } catch (error) {
    return failFromError(error, "Error al listar.");
  }
}

export async function createAdmin(request: NextRequest, resource: ResourceName) {
  try {
    const admin = await requireAdmin();
    if (resource === "usuarios" && !isSuperAdmin(admin.rol)) {
      return fail("Solo superadmin puede crear usuarios.", 403);
    }

    const input = await readJson<Record<string, unknown>>(request);
    const delegate = modelDelegate(prisma, resource);
    const data = buildResourceData(resource, input);
    logImageDebug("create:input", resource, input);
    logImageDebug("create:data", resource, data);

    if (resource === "usuarios") {
      const password = String(input.password || "");
      if (password.length < 8) return fail("La contraseña debe tener al menos 8 caracteres.");
      const email = String(data.email || "");
      const existing = await prisma.adminUser.findUnique({ where: { email } });
      if (existing) return fail("Ya existe un usuario con ese correo.", 409);
      Object.assign(data, { password: await bcrypt.hash(password, 12) });
    }

    const item = await delegate.create({ data });
    logImageDebug("create:item", resource, item as Record<string, unknown>);
    await logActivity(admin, `crear:${resource}`, resource, JSON.stringify({ id: itemId(item) }));
    return ok(withoutPassword(item), { status: 201 });
  } catch (error) {
    return failFromError(error, "No se pudo crear.");
  }
}

export async function getAdmin(_request: NextRequest, resource: ResourceName, context: RouteParams) {
  try {
    await requireAdmin();
    const { id } = await context.params;
    const item =
      resource === "usuarios"
        ? await prisma.adminUser.findUnique({ where: { id }, select: adminUserSelect })
        : await modelDelegate(prisma, resource).findUnique({
            where: { id },
            include: ["productos", "repuestos"].includes(resource) ? { category: true } : undefined,
          });
    if (!item) return fail("Registro no encontrado.", 404);
    return ok(withoutPassword(item));
  } catch (error) {
    return failFromError(error, "No autorizado.");
  }
}

export async function updateAdmin(request: NextRequest, resource: ResourceName, context: RouteParams) {
  try {
    const admin = await requireAdmin();
    if (resource === "usuarios" && !isSuperAdmin(admin.rol)) {
      return fail("Solo superadmin puede editar usuarios.", 403);
    }

    const { id } = await context.params;
    const input = await readJson<Record<string, unknown>>(request);
    const data = buildResourceData(resource, input);
    logImageDebug("update:input", resource, input);
    logImageDebug("update:data", resource, data);

    if (resource === "usuarios") {
      if (id === admin.id && data.activo === false) {
        return fail("No puedes desactivar tu propio usuario.", 400);
      }
      const current = await prisma.adminUser.findUnique({ where: { id }, select: { rol: true, activo: true } });
      if (current?.activo && isSuperAdmin(current.rol) && (!data.activo || !isSuperAdmin(String(data.rol || "")))) {
        const superAdmins = await prisma.adminUser.count({ where: { activo: true, OR: [{ rol: "SUPER_ADMIN" }, { rol: "superadmin" }] } });
        if (superAdmins <= 1) return fail("No puedes quitar el último SUPER_ADMIN activo.", 400);
      }
      const email = String(data.email || "");
      const existing = await prisma.adminUser.findFirst({ where: { email, id: { not: id } } });
      if (existing) return fail("Ya existe otro usuario con ese correo.", 409);

      const password = String(input.password || "");
      if (password) {
        if (password.length < 8) return fail("La contraseña debe tener al menos 8 caracteres.");
        Object.assign(data, { password: await bcrypt.hash(password, 12) });
      }
    }

    const item = await modelDelegate(prisma, resource).update({ where: { id }, data });
    logImageDebug("update:item", resource, item as Record<string, unknown>);
    await logActivity(admin, `actualizar:${resource}`, resource, JSON.stringify({ id }));
    return ok(withoutPassword(item));
  } catch (error) {
    return failFromError(error, "No se pudo actualizar.");
  }
}

export async function deleteAdmin(_request: NextRequest, resource: ResourceName, context: RouteParams) {
  try {
    const admin = await requireAdmin();
    if (resource === "usuarios" && !isSuperAdmin(admin.rol)) {
      return fail("Solo superadmin puede eliminar usuarios.", 403);
    }

    const { id } = await context.params;
    if (resource === "usuarios") {
      if (id === admin.id) return fail("No puedes eliminar ni desactivar tu propio usuario.", 400);
      const current = await prisma.adminUser.findUnique({ where: { id }, select: { rol: true, activo: true } });
      if (current?.activo && isSuperAdmin(current.rol)) {
        const superAdmins = await prisma.adminUser.count({ where: { activo: true, OR: [{ rol: "SUPER_ADMIN" }, { rol: "superadmin" }] } });
        if (superAdmins <= 1) return fail("No puedes desactivar el último SUPER_ADMIN activo.", 400);
      }
      const item = await prisma.adminUser.update({ where: { id }, data: { activo: false } });
      await logActivity(admin, "desactivar:usuarios", resource, JSON.stringify({ id }));
      return ok(withoutPassword(item));
    }

    const item = await modelDelegate(prisma, resource).delete({ where: { id } });
    await logActivity(admin, `eliminar:${resource}`, resource, JSON.stringify({ id }));
    return ok(item);
  } catch (error) {
    return failFromError(error, "No se pudo eliminar.");
  }
}

export function buildSearchWhere(resource: ResourceName, q?: string) {
  const productType = resource === "repuestos" ? "repuesto" : resource === "productos" ? "producto" : null;
  if (!q) return productType ? { tipo: productType } : undefined;
  if (resource === "productos" || resource === "repuestos") {
    return {
      ...(productType ? { tipo: productType } : {}),
      OR: [
        { nombre: { contains: q } },
        { descripcionCorta: { contains: q } },
        { marca: { contains: q } },
        { modelo: { contains: q } },
        { tags: { contains: q } },
      ],
    };
  }
  if (resource === "categorias" || resource === "servicios" || resource === "marcas") {
    return { nombre: { contains: q } };
  }
  if (resource === "proyectos") return { titulo: { contains: q } };
  if (resource === "faqs") return { pregunta: { contains: q } };
  if (resource === "testimonios") return { nombre: { contains: q } };
  if (resource === "usuarios") return { OR: [{ nombre: { contains: q } }, { email: { contains: q } }] };
  if (resource === "leads") return { consulta: { contains: q } };
  if (resource === "reclamaciones") return { OR: [{ nombre: { contains: q } }, { documento: { contains: q } }] };
  return undefined;
}

function buildOrder(resource: ResourceName) {
  if (["categorias", "servicios", "proyectos", "banners", "marcas", "faqs", "testimonios"].includes(resource)) {
    return { orden: "asc" };
  }
  if (resource === "configuracion") {
    return { updatedAt: "desc" };
  }
  return { createdAt: "desc" };
}

async function logActivity(
  admin: { id: string; nombre: string },
  accion: string,
  modulo: string,
  detalle?: string
) {
  await prisma.activityLog.create({
    data: {
      userId: admin.id,
      userName: admin.nombre,
      accion,
      modulo,
      detalle,
    },
  });
}

function itemId(item: unknown) {
  return typeof item === "object" && item && "id" in item ? item.id : null;
}

const adminUserSelect = {
  id: true,
  nombre: true,
  email: true,
  rol: true,
  activo: true,
  ultimoAcceso: true,
  createdAt: true,
};

function withoutPassword(item: unknown) {
  if (typeof item !== "object" || !item) return item;
  if (!("password" in item)) return item;
  const copy = { ...(item as Record<string, unknown>) };
  delete copy.password;
  return copy;
}

function failFromError(error: unknown, fallback: string) {
  const message = error instanceof Error ? error.message : fallback;
  const normalized = message.toLowerCase();
  const status = normalized.includes("autoriz") || normalized.includes("autentic") ? 401 : 400;
  return fail(message || fallback, status);
}

function logImageDebug(stage: string, resource: ResourceName, value: Record<string, unknown>) {
  if (resource !== "productos" && resource !== "repuestos") return;
  console.info(`[admin:image:${stage}]`, {
    nombre: value.nombre,
    imagenPrincipal: value.imagenPrincipal,
    imagenes: value.imagenes,
  });
}
