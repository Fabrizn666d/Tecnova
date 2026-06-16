export type StoredCatalogItem = {
  id: string;
  tipo: "producto" | "repuesto";
  nombre: string;
  slug: string;
  marca?: string | null;
  modelo?: string | null;
  categoria?: string | null;
  imagen?: string | null;
  precio?: number | null;
  disponible?: boolean;
};

export type StoredQuoteItem = StoredCatalogItem & {
  cantidad: number;
};

export const QUOTE_STORAGE_KEY = "tecnova:quote-items";
export const COMPARE_STORAGE_KEY = "tecnova:compare-items";
export const STORAGE_EVENT = "tecnova:storage-update";

function safeRead<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function safeWrite<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new CustomEvent(STORAGE_EVENT));
}

export function readQuoteItems() {
  return safeRead<StoredQuoteItem[]>(QUOTE_STORAGE_KEY, []);
}

export function addQuoteItem(item: StoredCatalogItem) {
  const items = readQuoteItems();
  const existing = items.find((current) => current.id === item.id);
  const next = existing
    ? items.map((current) => (current.id === item.id ? { ...current, cantidad: current.cantidad + 1 } : current))
    : [...items, { ...item, cantidad: 1 }];
  safeWrite(QUOTE_STORAGE_KEY, next);
  return next;
}

export function removeQuoteItem(id: string) {
  const next = readQuoteItems().filter((item) => item.id !== id);
  safeWrite(QUOTE_STORAGE_KEY, next);
  return next;
}

export function updateQuoteItemQuantity(id: string, cantidad: number) {
  const next = readQuoteItems().map((item) =>
    item.id === id ? { ...item, cantidad: Math.max(1, Math.min(cantidad, 99)) } : item
  );
  safeWrite(QUOTE_STORAGE_KEY, next);
  return next;
}

export function clearQuoteItems() {
  safeWrite(QUOTE_STORAGE_KEY, []);
}

export function readCompareItems() {
  return safeRead<StoredCatalogItem[]>(COMPARE_STORAGE_KEY, []);
}

export function addCompareItem(item: StoredCatalogItem) {
  const items = readCompareItems();
  if (items.some((current) => current.id === item.id)) return items;
  const next = [...items, item].slice(0, 4);
  safeWrite(COMPARE_STORAGE_KEY, next);
  return next;
}

export function removeCompareItem(id: string) {
  const next = readCompareItems().filter((item) => item.id !== id);
  safeWrite(COMPARE_STORAGE_KEY, next);
  return next;
}

export function clearCompareItems() {
  safeWrite(COMPARE_STORAGE_KEY, []);
}
