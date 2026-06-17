import { readFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

type Props = {
  params: Promise<{ filename: string }>;
};

const contentTypes: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
};

export async function GET(_request: Request, { params }: Props) {
  const { filename } = await params;
  const safeName = path.basename(filename);
  if (!safeName || safeName !== filename) {
    return NextResponse.json({ ok: false, message: "Archivo no encontrado." }, { status: 404 });
  }

  const uploadDir = path.normalize(path.join(process.cwd(), "public", "uploads"));
  const filePath = path.normalize(path.join(uploadDir, safeName));
  if (!filePath.startsWith(`${uploadDir}${path.sep}`)) {
    return NextResponse.json({ ok: false, message: "Archivo no permitido." }, { status: 403 });
  }

  try {
    const file = await readFile(filePath);
    const ext = path.extname(safeName).toLowerCase();
    return new Response(file, {
      headers: {
        "Content-Type": contentTypes[ext] || "application/octet-stream",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ ok: false, message: "Archivo no encontrado." }, { status: 404 });
  }
}
