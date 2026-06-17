import { createReadStream } from "fs";
import { copyFile, mkdir, readFile, readdir, rm, stat, writeFile } from "fs/promises";
import path from "path";
import { spawn } from "child_process";

export type BackupItem = {
  nombre: string;
  fecha: string;
  tamano: number;
  tipo: "automatico" | "manual";
};

const rootDir = process.cwd();
const backupNamePattern = /^(tecnova-manual-\d{4}-\d{2}-\d{2}-\d{2}-\d{2}|tecnova-backup-\d{4}-\d{2}-\d{2}-\d{2}-\d{2}|tecnova-auto-\d{4}-\d{2}-\d{2}-\d{2}-\d{2}|tecnova-auto-\d{4}-\d{2}-\d{2}-\d{4})\.tar\.gz$/;

export function backupDir() {
  return path.resolve(process.env.BACKUP_DIR || path.join(rootDir, "backups"));
}

export function isValidBackupFilename(filename: string) {
  return backupNamePattern.test(filename) && path.basename(filename) === filename;
}

export function backupPath(filename: string) {
  if (!isValidBackupFilename(filename)) throw new Error("Nombre de backup invalido.");
  return path.join(backupDir(), filename);
}

export async function listBackups(): Promise<BackupItem[]> {
  await mkdir(backupDir(), { recursive: true });
  const files = await readdir(backupDir());
  const backups = await Promise.all(
    files
      .filter(isValidBackupFilename)
      .map(async (file) => {
        const info = await stat(path.join(backupDir(), file));
        return {
          nombre: file,
          fecha: info.mtime.toISOString(),
          tamano: info.size,
          tipo: file.startsWith("tecnova-auto-") ? "automatico" as const : "manual" as const,
        };
      })
  );
  return backups.sort((a, b) => b.fecha.localeCompare(a.fecha));
}

export async function createManualBackup() {
  return createBackup("manual");
}

export async function openBackupStream(filename: string) {
  const filePath = backupPath(filename);
  await stat(filePath);
  return createReadStream(filePath);
}

async function createBackup(type: "manual" | "auto") {
  await mkdir(backupDir(), { recursive: true });
  const stamp = formatStamp(new Date());
  const filename = type === "manual" ? `tecnova-manual-${stamp}.tar.gz` : `tecnova-auto-${stamp}.tar.gz`;
  const outputPath = path.join(backupDir(), filename);
  const tempDir = path.join(backupDir(), `.tmp-${stamp}-${process.pid}`);
  await mkdir(tempDir, { recursive: true });

  try {
    try {
      await stat(outputPath);
      throw new Error("Ya existe un backup creado en este minuto. Intenta nuevamente en unos segundos.");
    } catch (error) {
      if (error instanceof Error && error.message.startsWith("Ya existe")) throw error;
    }

    const sourceEntries = await existingEntries(["prisma/tecnova.db", "public/uploads"]);
    if (!sourceEntries.includes("prisma/tecnova.db")) {
      throw new Error("No existe prisma/tecnova.db para respaldar.");
    }
    await mkdir(path.join(tempDir, "prisma"), { recursive: true });
    await copyFile(path.join(rootDir, "prisma/tecnova.db"), path.join(tempDir, "prisma/tecnova.db"));

    const rootEntries = sourceEntries.filter((entry) => entry !== "prisma/tecnova.db");
    const tempEntries = ["manifest.json", "prisma/tecnova.db"];

    const manifest = {
      fecha: new Date().toISOString(),
      tipo: type === "auto" ? "automatic" : "manual",
      nombre: filename,
      tamano: await totalSize(sourceEntries),
      version: await packageVersion(),
      archivos: sourceEntries,
    };
    await writeFile(path.join(tempDir, "manifest.json"), JSON.stringify(manifest, null, 2), "utf8");

    await runTar([
      "-czf",
      outputPath,
      "-C",
      tempDir,
      ...tempEntries,
      ...(rootEntries.length > 0 ? ["-C", rootDir, ...rootEntries] : []),
    ]);

    const info = await stat(outputPath);
    return {
      nombre: filename,
      fecha: info.mtime.toISOString(),
      tamano: info.size,
      tipo: type === "manual" ? "manual" as const : "automatico" as const,
    };
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
}

async function existingEntries(entries: string[]) {
  const found: string[] = [];
  for (const entry of entries) {
    try {
      await stat(path.join(rootDir, entry));
      found.push(entry);
    } catch {
      // Optional backup entries are skipped when they do not exist.
    }
  }
  return found;
}

async function packageVersion() {
  try {
    const pkg = JSON.parse(await readFile(path.join(rootDir, "package.json"), "utf8")) as { version?: string };
    return String(pkg.version || "sin-version");
  } catch {
    return "sin-version";
  }
}

async function totalSize(entries: string[]) {
  let total = 0;
  for (const entry of entries) total += await sizeOf(path.join(rootDir, entry));
  return total;
}

async function sizeOf(target: string): Promise<number> {
  const info = await stat(target);
  if (info.isFile()) return info.size;
  if (!info.isDirectory()) return 0;
  const children = await readdir(target);
  const sizes = await Promise.all(children.map((child) => sizeOf(path.join(target, child))));
  return sizes.reduce((sum, value) => sum + value, 0);
}

function runTar(args: string[]) {
  return new Promise<void>((resolve, reject) => {
    const child = spawn("tar", args, { windowsHide: true });
    let stderr = "";
    child.stderr.on("data", (chunk) => {
      stderr += String(chunk);
    });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(stderr.trim() || "No se pudo crear el archivo comprimido."));
    });
  });
}

function formatStamp(date: Date) {
  const parts = [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
    pad(date.getHours()),
    pad(date.getMinutes()),
  ];
  return `${parts[0]}-${parts[1]}-${parts[2]}-${parts[3]}-${parts[4]}`;
}

function pad(value: number) {
  return String(value).padStart(2, "0");
}
