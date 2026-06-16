import { randomUUID } from "crypto";
import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";
import sharp from "sharp";

const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);

export async function saveUpload(file: File, folder = "general") {
  const maxSize = Number(process.env.MAX_FILE_SIZE || 10_485_760);
  if (file.size > maxSize) {
    throw new Error("El archivo excede el tamaño máximo permitido.");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const safeFolder = folder.replace(/[^a-z0-9-_]/gi, "").toLowerCase() || "general";
  const uploadDir = path.join(process.cwd(), "public", "uploads", safeFolder);
  await mkdir(uploadDir, { recursive: true });

  if (file.type === "application/pdf") {
    const filename = `${randomUUID()}.pdf`;
    const fullPath = path.join(uploadDir, filename);
    await writeFile(fullPath, buffer);
    return `/uploads/${safeFolder}/${filename}`;
  }

  if (!allowedTypes.has(file.type)) {
    throw new Error("Formato no permitido. Usa JPG, PNG, WebP, AVIF o PDF.");
  }

  const filename = `${randomUUID()}.webp`;
  const fullPath = path.join(uploadDir, filename);
  await sharp(buffer)
    .rotate()
    .resize({ width: 1800, withoutEnlargement: true })
    .webp({ quality: 82 })
    .toFile(fullPath);

  return `/uploads/${safeFolder}/${filename}`;
}

export async function deleteUpload(publicPath: string) {
  if (!publicPath.startsWith("/uploads/")) {
    throw new Error("Solo se pueden eliminar archivos de uploads.");
  }
  const fullPath = path.join(process.cwd(), "public", publicPath);
  await unlink(fullPath);
}
