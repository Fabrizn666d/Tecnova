import { randomUUID } from "crypto";
import { mkdir, readFile, readdir, stat, unlink, writeFile } from "fs/promises";
import path from "path";
import sharp from "sharp";
import { prisma } from "@/lib/prisma";
import { hasProductBackgroundImageColumn } from "@/lib/product-db";

export const backgroundFolderName = "Imagess";

const allowedListExtensions = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif", ".gif", ".svg"]);
const allowedUploadMime = new Set(["image/jpeg", "image/png", "image/webp"]);
const defaultMaxBackgroundSize = 15 * 1024 * 1024;

export type BackgroundImageItem = {
  filename: string;
  name: string;
  url: string;
  label: string;
  usageCount?: number;
  bytes?: number;
};

export function getBackgroundDir() {
  return path.join(process.cwd(), "public", backgroundFolderName);
}

export function isAllowedBackgroundFilename(filename: string) {
  if (!filename || filename.includes("/") || filename.includes("\\")) return false;
  return allowedListExtensions.has(path.extname(filename).toLowerCase());
}

export async function listBackgroundImages() {
  await mkdir(getBackgroundDir(), { recursive: true });
  const entries = await readdir(getBackgroundDir(), { withFileTypes: true });
  const backgrounds = entries
    .filter((entry) => entry.isFile() && isAllowedBackgroundFilename(entry.name))
    .map((entry) => createBackgroundItem(entry.name))
    .sort((a, b) => a.label.localeCompare(b.label, "es"));

  if (!(await hasProductBackgroundImageColumn())) {
    return backgrounds.map((background) => ({ ...background, usageCount: 0 }));
  }

  const usageRows = await Promise.all(
    backgrounds.map(async (background) => ({
      filename: background.filename,
      usageCount: await prisma.product.count({ where: { backgroundImage: background.filename } }),
    }))
  );
  const usage = new Map(usageRows.map((row) => [row.filename, row.usageCount]));
  return backgrounds.map((background) => ({ ...background, usageCount: usage.get(background.filename) || 0 }));
}

export async function saveBackgroundImage(file: File) {
  const maxBackgroundSize = getMaxBackgroundSize();
  if (!(file instanceof File)) {
    throw new Error("No se recibio una imagen valida.");
  }
  if (file.size <= 0) {
    throw new Error("La imagen seleccionada esta vacia.");
  }
  if (file.size > maxBackgroundSize) {
    throw new Error(`El fondo no debe superar ${Math.round(maxBackgroundSize / 1024 / 1024)}MB.`);
  }

  const mime = file.type.toLowerCase();
  if (!allowedUploadMime.has(mime)) {
    throw new Error("Formato no permitido. Usa JPG, JPEG, PNG o WebP.");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  if (buffer.length <= 0) {
    throw new Error("No se recibieron bytes de la imagen.");
  }

  const extension = extensionForMime(mime);
  const finalName = `fondo-${randomUUID()}${extension}`;
  const finalDir = getBackgroundDir();
  const absolutePath = path.join(finalDir, finalName);
  const item = createBackgroundItem(finalName);

  await validateRaster(buffer, extension);
  await mkdir(finalDir, { recursive: true });
  await writeFile(absolutePath, buffer, { flag: "wx" });

  const existsAfterWrite = await stat(absolutePath).then(() => true).catch(() => false);
  const savedBytes = await readFile(absolutePath);
  const bytesMatch = savedBytes.length === buffer.length;

  console.info("[fondos-producto] fondo guardado", {
    finalName,
    absolutePath,
    publicUrl: item.url,
    existsAfterWrite,
    bytesWritten: buffer.length,
    savedBytes: savedBytes.length,
    bytesMatch,
  });

  if (!existsAfterWrite || !bytesMatch) {
    throw new Error("El fondo se escribio, pero la verificacion del archivo fallo.");
  }

  return { ...item, bytes: buffer.length };
}

export async function deleteBackgroundImage(filenameOrUrl: string, force = false) {
  const filename = path.basename(String(filenameOrUrl || "").split("?")[0]);
  if (!isAllowedBackgroundFilename(filename)) {
    throw new Error("Nombre de fondo no permitido.");
  }

  const backgroundDir = path.normalize(getBackgroundDir());
  const fullPath = path.normalize(path.join(backgroundDir, filename));
  if (!fullPath.startsWith(`${backgroundDir}${path.sep}`)) {
    throw new Error("Ruta de fondo no permitida.");
  }

  const hasBackgroundColumn = await hasProductBackgroundImageColumn();
  const usageCount = hasBackgroundColumn ? await prisma.product.count({ where: { backgroundImage: filename } }) : 0;
  if (usageCount > 0 && !force) {
    return { deleted: false, usageCount, requiresForce: true };
  }

  try {
    await unlink(fullPath);
  } catch {
    throw new Error("El fondo no existe o no se pudo eliminar.");
  }
  if (usageCount > 0 && hasBackgroundColumn) {
    await prisma.product.updateMany({ where: { backgroundImage: filename }, data: { backgroundImage: null } });
  }
  return { deleted: true, usageCount, requiresForce: false };
}

function getMaxBackgroundSize() {
  const configured = Number(process.env.BACKGROUND_MAX_FILE_SIZE || process.env.MAX_FILE_SIZE);
  return Number.isFinite(configured) && configured > 0 ? configured : defaultMaxBackgroundSize;
}

function extensionForMime(mime: string) {
  if (mime === "image/png") return ".png";
  if (mime === "image/webp") return ".webp";
  return ".jpg";
}

function publicBackgroundUrl(name: string) {
  return `/${backgroundFolderName}/${encodeURIComponent(name)}`;
}

export function createBackgroundItem(finalName: string): BackgroundImageItem {
  return {
    filename: finalName,
    name: finalName,
    url: publicBackgroundUrl(finalName),
    label: filenameToLabel(finalName),
  };
}

async function validateRaster(buffer: Buffer, extension: string) {
  console.log("[fondos-producto] buffer first 32 bytes", buffer.slice(0, 32));
  const detected = await fileTypeFromBuffer(buffer);
  console.log("[fondos-producto] fileTypeFromBuffer", detected);

  const signatures: Record<string, (value: Buffer) => boolean> = {
    ".jpg": (value) => value.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff])),
    ".png": (value) => value.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
    ".webp": (value) => value.subarray(0, 4).toString("ascii") === "RIFF" && value.subarray(8, 12).toString("ascii") === "WEBP",
  };
  if (signatures[extension]?.(buffer)) {
    return;
  }

  try {
    const metadata = await sharp(buffer, { failOn: "none" }).metadata();
    if (metadata.format && ["jpeg", "png", "webp"].includes(metadata.format)) {
      console.log("[fondos-producto] sharp acepto imagen", metadata.format);
      return;
    }
    console.log("[fondos-producto] sharp formato no permitido", metadata.format);
  } catch (error) {
    console.log("[fondos-producto] sharp error", error);
  }

  throw new Error("El contenido del archivo no corresponde a una imagen valida.");
}

async function fileTypeFromBuffer(buffer: Buffer) {
  if (buffer.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff]))) {
    return { ext: "jpg", mime: "image/jpeg" };
  }
  if (buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) {
    return { ext: "png", mime: "image/png" };
  }
  if (buffer.subarray(0, 4).toString("ascii") === "RIFF" && buffer.subarray(8, 12).toString("ascii") === "WEBP") {
    return { ext: "webp", mime: "image/webp" };
  }
  return undefined;
}

function filenameToLabel(filename: string) {
  return path
    .basename(filename, path.extname(filename))
    .replace(/fondo-/i, "Fondo ")
    .replace(/-[0-9a-f]{8}-[0-9a-f-]{27}$/i, "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase()) || filename;
}
