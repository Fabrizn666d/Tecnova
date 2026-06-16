import { randomUUID } from "crypto";
import { mkdir, unlink } from "fs/promises";
import path from "path";
import sharp from "sharp";

const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const maxUploadSize = 5 * 1024 * 1024;

export async function saveUpload(file: File, folder = "general") {
  if (file.size > maxUploadSize) {
    throw new Error("El archivo excede el tamaño máximo permitido de 5MB.");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const safeFolder = folder.replace(/[^a-z0-9-_]/gi, "").toLowerCase() || "general";
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });

  if (!allowedTypes.has(file.type)) {
    throw new Error("Formato no permitido. Usa JPG, JPEG, PNG o WebP.");
  }

  const filename = `${safeFolder}-${randomUUID()}.webp`;
  const fullPath = path.join(uploadDir, filename);
  await sharp(buffer)
    .rotate()
    .resize({ width: 1800, withoutEnlargement: true })
    .webp({ quality: 82 })
    .toFile(fullPath);

  return `/uploads/${filename}`;
}

export async function deleteUpload(publicPath: string) {
  if (!publicPath.startsWith("/uploads/")) {
    throw new Error("Solo se pueden eliminar archivos de uploads.");
  }
  const uploadDir = path.normalize(path.join(process.cwd(), "public", "uploads"));
  const fullPath = path.normalize(path.join(process.cwd(), "public", publicPath));
  if (!fullPath.startsWith(`${uploadDir}${path.sep}`)) {
    throw new Error("Ruta de archivo no permitida.");
  }
  await unlink(fullPath);
}
