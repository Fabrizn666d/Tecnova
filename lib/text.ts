const replacements: [string, string][] = [
  ["Â¿", "¿"],
  ["Â¡", "¡"],
  ["Ã¡", "á"],
  ["Ã©", "é"],
  ["Ã­", "í"],
  ["Ã³", "ó"],
  ["Ãº", "ú"],
  ["Ã±", "ñ"],
  ["Ã", "Á"],
  ["Ã‰", "É"],
  ["Ã", "Í"],
  ["Ã“", "Ó"],
  ["Ãš", "Ú"],
  ["Ã‘", "Ñ"],
  ["ï¿½", "¿"],
  ["Tecnova Per?", "Tecnova Perú"],
  ["�Realizan instalaci�n?", "¿Realizan instalación?"],
  ["¿Venden", "¿Venden"],
  ["¿Atienden", "¿Atienden"],
  ["instalaci�n", "instalación"],
  ["reparaci�n", "reparación"],
  ["cotizaci�n", "cotización"],
  ["t�cnico", "técnico"],
  ["t�cnica", "técnica"],
  ["Per�", "Perú"],
  ["informaci�n", "información"],
  ["descripci�n", "descripción"],
];

export function repairText(value: string | null | undefined) {
  if (!value) return "";
  return replacements.reduce((text, [from, to]) => text.replaceAll(from, to), value);
}
