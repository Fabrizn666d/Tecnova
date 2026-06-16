export type CatalogKind = "producto" | "repuesto";

export type CatalogCard = {
  id: string;
  tipo: CatalogKind;
  nombre: string;
  slug: string;
  descripcionCorta: string;
  categoria: string;
  categoriaSlug: string;
  marca: string | null;
  modelo: string | null;
  condicion: string;
  precio: number | null;
  mostrarPrecio: boolean;
  etiquetaPrecio: string | null;
  imagen: string;
  disponible: boolean;
  destacado: boolean;
  cotizaciones: number;
  caracteristicas: string[];
};

export type CategoryOption = {
  id: string;
  nombre: string;
  slug: string;
};

export type BrandOption = {
  id: string;
  nombre: string;
  logo?: string | null;
};
