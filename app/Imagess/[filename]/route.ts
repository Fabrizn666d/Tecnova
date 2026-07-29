import { getBackgroundDir, isAllowedBackgroundFilename } from "@/lib/background-images";
import { readFile, stat } from "fs/promises";
import path from "path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

type RouteContext = {
  params: Promise<{ filename: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { filename: rawFilename } = await context.params;
  const filename = path.basename(decodeURIComponent(rawFilename || ""));

  if (!isAllowedBackgroundFilename(filename)) {
    return new Response("Archivo no permitido.", { status: 400 });
  }

  const backgroundDir = path.normalize(getBackgroundDir());
  const absolutePath = path.normalize(path.join(backgroundDir, filename));
  if (!absolutePath.startsWith(`${backgroundDir}${path.sep}`)) {
    return new Response("Ruta no permitida.", { status: 400 });
  }

  try {
    const [file, info] = await Promise.all([readFile(absolutePath), stat(absolutePath)]);
    return new Response(file, {
      headers: {
        "Content-Type": contentTypeFor(filename),
        "Content-Length": String(info.size),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("[Imagess] fondo no encontrado", { filename, absolutePath, error });
    return new Response("Fondo no encontrado.", { status: 404 });
  }
}

function contentTypeFor(filename: string) {
  const extension = path.extname(filename).toLowerCase();
  if (extension === ".png") return "image/png";
  if (extension === ".webp") return "image/webp";
  if (extension === ".gif") return "image/gif";
  if (extension === ".svg") return "image/svg+xml";
  return "image/jpeg";
}
