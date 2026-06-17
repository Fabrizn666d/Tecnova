import { randomUUID } from "crypto";
import { mkdir, unlink } from "fs/promises";
import path from "path";
import sharp from "sharp";

const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const unsupportedAppleTypes = new Set(["image/heic", "image/heif"]);
const maxUploadSize = 10 * 1024 * 1024;

export function getUploadDir() {
  return process.env.UPLOAD_DIR
    ? path.resolve(process.env.UPLOAD_DIR)
    : path.join(process.cwd(), "public", "uploads");
}

export async function saveUpload(file: File, folder = "general") {
  if (file.size > maxUploadSize) {
    throw new Error("La imagen excede el tamaño máximo permitido de 10MB.");
  }

  if (unsupportedAppleTypes.has(file.type)) {
    throw new Error("Formato HEIC/HEIF no compatible. Convierte la imagen a JPG, PNG o WebP antes de subirla.");
  }

  if (!allowedTypes.has(file.type)) {
    throw new Error("Formato no permitido. Usa JPG, JPEG, PNG o WebP.");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const safeFolder = folder.replace(/[^a-z0-9-_]/gi, "").toLowerCase() || "general";
  const uploadDir = getUploadDir();
  await mkdir(uploadDir, { recursive: true });

  const filename = `${safeFolder}-${randomUUID()}.webp`;
  const fullPath = path.join(uploadDir, filename);

  try {
    await sharp(buffer)
      .rotate()
      .resize({ width: 1800, withoutEnlargement: true })
      .webp({ quality: 82 })
      .toFile(fullPath);
  } catch {
    throw new Error("No se pudo procesar la imagen. Puede estar corrupta o tener un formato no compatible.");
  }

  return `/uploads/${filename}`;
}

export async function deleteUpload(publicPath: string) {
  if (!publicPath.startsWith("/uploads/")) {
    throw new Error("Solo se pueden eliminar archivos de uploads.");
  }
  const uploadDir = path.normalize(getUploadDir());
  const fullPath = path.normalize(path.join(uploadDir, path.basename(publicPath)));
  if (!fullPath.startsWith(`${uploadDir}${path.sep}`)) {
    throw new Error("Ruta de archivo no permitida.");
  }
  await unlink(fullPath);
}
