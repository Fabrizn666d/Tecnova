export const productBackgroundPublicFolder = "Imagess";

export function productBackgroundSrc(filename?: string | null) {
  if (!filename || filename.includes("/") || filename.includes("\\")) return "";
  return `/${productBackgroundPublicFolder}/${filename}`;
}
