import { requireAdmin } from "@/lib/auth";
import { fail, ok, parsePagination, readJson } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { buildResourceData, modelDelegate, type ResourceName } from "@/lib/resources";
import bcrypt from "bcryptjs";
import type { NextRequest } from "next/server";

type RouteParams = { params: Promise<{ id: string }> };

export async function listAdmin(request: NextRequest, resource: ResourceName) {
  try {
    const admin = await requireAdmin();
    if (resource === "usuarios" && admin.rol !== "superadmin") {
      return fail("Solo superadmin puede gestionar usuarios.", 403);
    }

    const { searchParams } = request.nextUrl;
    const { pagina, limite, skip } = parsePagination(searchParams);
    const q = searchParams.get("q")?.trim();
    const delegate = modelDelegate(prisma, resource);
    const where = buildSearchWhere(resource, q);
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
    return fail(error instanceof Error ? error.message : "Error al listar.", 401);
  }
}

export async function createAdmin(request: NextRequest, resource: ResourceName) {
  try {
    const admin = await requireAdmin();
    if (resource === "usuarios" && admin.rol !== "superadmin") {
      return fail("Solo superadmin puede crear usuarios.", 403);
    }

    const input = await readJson<Record<string, unknown>>(request);
    const delegate = modelDelegate(prisma, resource);
    const data = buildResourceData(resource, input);

    if (resource === "usuarios") {
      const password = String(input.password || "");
      if (password.length < 8) return fail("La contraseña debe tener al menos 8 caracteres.");
      Object.assign(data, { password: await bcrypt.hash(password, 12) });
    }

    const item = await delegate.create({ data });
    await logActivity(admin, `crear:${resource}`, resource, JSON.stringify({ id: itemId(item) }));
    return ok(item, { status: 201 });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "No se pudo crear.");
  }
}

export async function getAdmin(_request: NextRequest, resource: ResourceName, context: RouteParams) {
  try {
    await requireAdmin();
    const { id } = await context.params;
    const item = await modelDelegate(prisma, resource).findUnique({
      where: { id },
      include: ["productos", "repuestos"].includes(resource) ? { category: true } : undefined,
    });
    if (!item) return fail("Registro no encontrado.", 404);
    return ok(item);
  } catch (error) {
    return fail(error instanceof Error ? error.message : "No autorizado.", 401);
  }
}

export async function updateAdmin(request: NextRequest, resource: ResourceName, context: RouteParams) {
  try {
    const admin = await requireAdmin();
    if (resource === "usuarios" && admin.rol !== "superadmin") {
      return fail("Solo superadmin puede editar usuarios.", 403);
    }

    const { id } = await context.params;
    const input = await readJson<Record<string, unknown>>(request);
    const data = buildResourceData(resource, input);

    if (resource === "usuarios" && input.password) {
      Object.assign(data, { password: await bcrypt.hash(String(input.password), 12) });
    }

    const item = await modelDelegate(prisma, resource).update({ where: { id }, data });
    await logActivity(admin, `actualizar:${resource}`, resource, JSON.stringify({ id }));
    return ok(item);
  } catch (error) {
    return fail(error instanceof Error ? error.message : "No se pudo actualizar.");
  }
}

export async function deleteAdmin(_request: NextRequest, resource: ResourceName, context: RouteParams) {
  try {
    const admin = await requireAdmin();
    if (resource === "usuarios" && admin.rol !== "superadmin") {
      return fail("Solo superadmin puede eliminar usuarios.", 403);
    }

    const { id } = await context.params;
    const item = await modelDelegate(prisma, resource).delete({ where: { id } });
    await logActivity(admin, `eliminar:${resource}`, resource, JSON.stringify({ id }));
    return ok(item);
  } catch (error) {
    return fail(error instanceof Error ? error.message : "No se pudo eliminar.");
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
  if (resource === "leads") return { consulta: { contains: q } };
  if (resource === "reclamaciones") return { OR: [{ nombre: { contains: q } }, { documento: { contains: q } }] };
  return undefined;
}

function buildOrder(resource: ResourceName) {
  if (["categorias", "servicios", "proyectos", "banners", "marcas", "faqs", "testimonios"].includes(resource)) {
    return { orden: "asc" };
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
