import { randomUUID } from "crypto";
import { mkdir, readdir, writeFile } from "fs/promises";
import path from "path";

export const backgroundFolderName = "Imagess";

const allowedExtensions = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif", ".gif", ".svg"]);
const defaultMaxBackgroundSize = 10 * 1024 * 1024;

export function getBackgroundDir() {
  return path.join(process.cwd(), "public", backgroundFolderName);
}

export function isAllowedBackgroundFilename(filename: string) {
  if (!filename || filename.includes("/") || filename.includes("\\")) return false;
  return allowedExtensions.has(path.extname(filename).toLowerCase());
}

export async function listBackgroundImages() {
  await mkdir(getBackgroundDir(), { recursive: true });
  const entries = await readdir(getBackgroundDir(), { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && isAllowedBackgroundFilename(entry.name))
    .map((entry) => ({
      filename: entry.name,
      url: `/${backgroundFolderName}/${entry.name}`,
      label: filenameToLabel(entry.name),
    }))
    .sort((a, b) => a.label.localeCompare(b.label, "es"));
}

export async function saveBackgroundImage(file: File) {
  const maxBackgroundSize = getMaxBackgroundSize();
  if (file.size > maxBackgroundSize) {
    throw new Error(`El fondo no debe superar ${Math.round(maxBackgroundSize / 1024 / 1024)}MB.`);
  }

  const originalName = file.name || "fondo";
  const extension = path.extname(originalName).toLowerCase();
  if (!allowedExtensions.has(extension)) {
    throw new Error("Formato no permitido. Usa JPG, JPEG, PNG, WebP, GIF, AVIF o SVG.");
  }
  if (file.type && !isAllowedMimeForExtension(file.type, extension)) {
    throw new Error("El tipo MIME no coincide con la extensión del archivo.");
  }

  await mkdir(getBackgroundDir(), { recursive: true });
  const base = path
    .basename(originalName, extension)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9-_]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase()
    .slice(0, 70) || "fondo";
  const filename = `${base}-${randomUUID()}${extension}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  const content = extension === ".svg" ? sanitizeSvg(buffer) : validateRaster(buffer, extension);
  await writeFile(path.join(getBackgroundDir(), filename), content);
  return {
    filename,
    url: `/${backgroundFolderName}/${filename}`,
    label: filenameToLabel(filename),
  };
}

function getMaxBackgroundSize() {
  const configured = Number(process.env.BACKGROUND_MAX_FILE_SIZE || process.env.MAX_FILE_SIZE);
  return Number.isFinite(configured) && configured > 0 ? configured : defaultMaxBackgroundSize;
}

function isAllowedMimeForExtension(mime: string, extension: string) {
  const normalized = mime.toLowerCase();
  const byExtension: Record<string, string[]> = {
    ".jpg": ["image/jpeg"],
    ".jpeg": ["image/jpeg"],
    ".png": ["image/png"],
    ".webp": ["image/webp"],
    ".gif": ["image/gif"],
    ".avif": ["image/avif"],
    ".svg": ["image/svg+xml", "text/xml", "application/xml"],
  };
  return (byExtension[extension] || []).includes(normalized);
}

function validateRaster(buffer: Buffer, extension: string) {
  const signatures: Record<string, (buffer: Buffer) => boolean> = {
    ".jpg": (value) => value.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff])),
    ".jpeg": (value) => value.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff])),
    ".png": (value) => value.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
    ".webp": (value) => value.subarray(0, 4).toString("ascii") === "RIFF" && value.subarray(8, 12).toString("ascii") === "WEBP",
    ".gif": (value) => ["GIF87a", "GIF89a"].includes(value.subarray(0, 6).toString("ascii")),
    ".avif": (value) => value.subarray(4, 8).toString("ascii") === "ftyp" && value.subarray(8, 32).includes(Buffer.from("avif")),
  };
  if (!signatures[extension]?.(buffer)) {
    throw new Error("El contenido del archivo no corresponde a una imagen válida.");
  }
  return buffer;
}

function sanitizeSvg(buffer: Buffer) {
  const svg = buffer.toString("utf8").trim();
  const body = svg.replace(/^<\?xml[\s\S]*?\?>\s*/i, "").trim();
  const forbiddenPatterns = [
    /<\s*script\b/i,
    /<\s*foreignobject\b/i,
    /<\s*iframe\b/i,
    /\son[a-z]+\s*=/i,
    /javascript\s*:/i,
    /data\s*:/i,
    /\b(?:href|xlink:href|src)\s*=\s*["']\s*(?:https?:)?\/\//i,
    /<\s*image\b/i,
    /<!doctype/i,
    /<!entity/i,
  ];
  if (!body.toLowerCase().startsWith("<svg") || forbiddenPatterns.some((pattern) => pattern.test(svg))) {
    throw new Error("SVG no permitido: contiene scripts, eventos o recursos externos.");
  }
  return Buffer.from(svg, "utf8");
}

function filenameToLabel(filename: string) {
  return path
    .basename(filename, path.extname(filename))
    .replace(/-[0-9a-f]{8}-[0-9a-f-]{27}$/i, "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase()) || filename;
}
