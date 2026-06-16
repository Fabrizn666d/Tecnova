"use client";

import type { BrandOption, CatalogCard, CatalogKind, CategoryOption } from "@/lib/catalog-types";
import { Grid2X2, List, Search, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import ProductCard from "./ProductCard";

export default function CatalogBrowser({
  kind,
  items,
  categories,
  brands,
  initialQuery = "",
  initialCategory = "todos",
  initialBrand = "todos",
}: {
  kind: CatalogKind;
  items: CatalogCard[];
  categories: CategoryOption[];
  brands: BrandOption[];
  initialQuery?: string;
  initialCategory?: string;
  initialBrand?: string;
}) {
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState(initialCategory);
  const [brand, setBrand] = useState(initialBrand);
  const [availability, setAvailability] = useState("todos");
  const [condition, setCondition] = useState("todos");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [order, setOrder] = useState("relevantes");
  const [view, setView] = useState<"grid" | "list">("grid");

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const min = Number(minPrice);
    const max = Number(maxPrice);

    return items
      .filter((item) => {
        const haystack = `${item.nombre} ${item.descripcionCorta} ${item.marca || ""} ${item.modelo || ""} ${item.categoria}`.toLowerCase();
        const matchesQuery = !normalized || haystack.includes(normalized);
        const matchesCategory = category === "todos" || item.categoriaSlug === category;
        const matchesBrand = brand === "todos" || item.marca === brand;
        const matchesAvailability =
          availability === "todos" || (availability === "disponible" ? item.disponible : !item.disponible);
        const matchesCondition = condition === "todos" || item.condicion === condition;
        const matchesMin = !Number.isFinite(min) || minPrice === "" || (item.precio != null && item.precio >= min);
        const matchesMax = !Number.isFinite(max) || maxPrice === "" || (item.precio != null && item.precio <= max);
        return matchesQuery && matchesCategory && matchesBrand && matchesAvailability && matchesCondition && matchesMin && matchesMax;
      })
      .sort((a, b) => {
        if (order === "recientes") return a.nombre.localeCompare(b.nombre, "es");
        if (order === "cotizados") return b.cotizaciones - a.cotizaciones;
        if (order === "precio-asc") return (a.precio ?? Number.MAX_SAFE_INTEGER) - (b.precio ?? Number.MAX_SAFE_INTEGER);
        if (order === "precio-desc") return (b.precio ?? 0) - (a.precio ?? 0);
        return Number(b.destacado) - Number(a.destacado);
      });
  }, [availability, brand, category, condition, items, maxPrice, minPrice, order, query]);

  return (
    <section className="mx-auto max-w-[1540px] px-4 py-8 sm:px-5 lg:px-14">
      <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
        <aside className="rounded-[26px] bg-white p-5 shadow-soft ring-1 ring-black/5 lg:sticky lg:top-24 lg:self-start">
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={18} className="text-tecnova-red" />
            <h2 className="text-lg font-black">Filtros</h2>
          </div>

          <div className="mt-5 space-y-4">
            <label className="block text-sm font-bold">
              Búsqueda
              <span className="mt-2 flex h-11 items-center rounded-2xl border border-neutral-200 px-3">
                <input value={query} onChange={(event) => setQuery(event.target.value)} className="min-w-0 flex-1 bg-transparent outline-none" />
                <Search size={16} />
              </span>
            </label>

            <FilterSelect label="Categoría" value={category} onChange={setCategory} options={[["todos", "Todas"], ...categories.map((item) => [item.slug, item.nombre] as const)]} />
            <FilterSelect label="Marca" value={brand} onChange={setBrand} options={[["todos", "Todas"], ...brands.map((item) => [item.nombre, item.nombre] as const)]} />
            <FilterSelect label="Disponibilidad" value={availability} onChange={setAvailability} options={[["todos", "Todas"], ["disponible", "Disponible"], ["consulta", "Consultar"]]} />
            <FilterSelect label="Estado" value={condition} onChange={setCondition} options={[["todos", "Todos"], ["nuevo", "Nuevo"], ["usado", "Usado"], ["reacondicionado", "Reacondicionado"]]} />
            <FilterSelect label="Ordenar" value={order} onChange={setOrder} options={[["relevantes", "Más relevantes"], ["recientes", "A-Z"], ["cotizados", "Más cotizados"], ["precio-asc", "Menor precio"], ["precio-desc", "Mayor precio"]]} />

            <div className="grid grid-cols-2 gap-2">
              <label className="block text-sm font-bold">
                Desde
                <input value={minPrice} onChange={(event) => setMinPrice(event.target.value)} inputMode="numeric" className="mt-2 h-11 w-full rounded-2xl border border-neutral-200 px-3 outline-none" />
              </label>
              <label className="block text-sm font-bold">
                Hasta
                <input value={maxPrice} onChange={(event) => setMaxPrice(event.target.value)} inputMode="numeric" className="mt-2 h-11 w-full rounded-2xl border border-neutral-200 px-3 outline-none" />
              </label>
            </div>
          </div>
        </aside>

        <div>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-tecnova-red">
                {kind === "repuesto" ? "Catálogo de repuestos" : "Catálogo de productos"}
              </p>
              <p className="mt-1 text-sm font-bold text-tecnova-steel">{filtered.length} resultados</p>
            </div>
            <div className="flex rounded-full bg-white p-1 shadow-sm ring-1 ring-black/5">
              <button type="button" onClick={() => setView("grid")} className={`grid h-10 w-10 place-items-center rounded-full ${view === "grid" ? "bg-black text-white" : "text-neutral-600"}`} aria-label="Vista grilla">
                <Grid2X2 size={17} />
              </button>
              <button type="button" onClick={() => setView("list")} className={`grid h-10 w-10 place-items-center rounded-full ${view === "list" ? "bg-black text-white" : "text-neutral-600"}`} aria-label="Vista lista">
                <List size={17} />
              </button>
            </div>
          </div>

          <div className={view === "grid" ? "grid gap-5 sm:grid-cols-2 xl:grid-cols-3" : "grid gap-5"}>
            {filtered.map((item) => (
              <ProductCard key={item.id} item={item} view={view} />
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="rounded-[26px] bg-white p-8 text-center shadow-soft ring-1 ring-black/5">
              <p className="text-xl font-black">No encontramos resultados</p>
              <p className="mt-2 text-sm font-semibold text-tecnova-steel">Prueba con otra marca, categoría o rango de precios.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly (readonly [string, string])[];
}) {
  return (
    <label className="block text-sm font-bold">
      {label}
      <select value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 h-11 w-full rounded-2xl border border-neutral-200 bg-white px-3 outline-none">
        {options.map(([optionValue, optionLabel]) => (
          <option key={optionValue} value={optionValue}>
            {optionLabel}
          </option>
        ))}
      </select>
    </label>
  );
}
