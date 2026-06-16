"use client";

import {
  Boxes,
  ClipboardList,
  FileWarning,
  FolderKanban,
  ImageIcon,
  Layers,
  LogOut,
  MessageCircle,
  Plus,
  Save,
  Search,
  Settings,
  ShieldCheck,
  Star,
  Trash2,
  Upload,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, useCallback, useEffect, useMemo, useState } from "react";

type ResourceKey =
  | "productos"
  | "repuestos"
  | "categorias"
  | "servicios"
  | "proyectos"
  | "banners"
  | "marcas"
  | "cotizaciones"
  | "testimonios"
  | "faqs"
  | "usuarios"
  | "configuracion"
  | "leads"
  | "reclamaciones";

type ApiList = {
  items: Record<string, unknown>[];
  total: number;
};

const modules: { key: ResourceKey; label: string; icon: React.ComponentType<{ size?: number }> }[] = [
  { key: "productos", label: "Productos", icon: Boxes },
  { key: "repuestos", label: "Repuestos", icon: Settings },
  { key: "categorias", label: "Categorías", icon: Layers },
  { key: "servicios", label: "Servicios", icon: ShieldCheck },
  { key: "proyectos", label: "Proyectos", icon: FolderKanban },
  { key: "banners", label: "Banners", icon: ImageIcon },
  { key: "marcas", label: "Marcas", icon: Star },
  { key: "cotizaciones", label: "Cotizaciones", icon: MessageCircle },
  { key: "testimonios", label: "Testimonios", icon: Users },
  { key: "faqs", label: "FAQs", icon: Search },
  { key: "leads", label: "Leads", icon: ClipboardList },
  { key: "reclamaciones", label: "Reclamaciones", icon: FileWarning },
  { key: "usuarios", label: "Usuarios", icon: Users },
  { key: "configuracion", label: "Configuración", icon: Settings },
];

const templates: Record<ResourceKey, Record<string, unknown>> = {
  productos: {
    tipo: "producto",
    nombre: "",
    slug: "",
    descripcionCorta: "",
    descripcionLarga: "",
    categoryId: "",
    marca: "",
    modelo: "",
    codigoRef: "",
    condicion: "nuevo",
    imagenPrincipal: "",
    imagenes: "[]",
    especificaciones: "[]",
    caracteristicas: "[]",
    aplicaciones: "[]",
    tags: "[]",
    activo: true,
    destacado: false,
    destacadoRepuesto: false,
    nuevo: false,
    disponible: true,
  },
  repuestos: {
    tipo: "repuesto",
    nombre: "",
    slug: "",
    descripcionCorta: "",
    descripcionLarga: "",
    categoryId: "",
    marca: "",
    modelo: "",
    codigoRef: "",
    condicion: "nuevo",
    imagenPrincipal: "",
    imagenes: "[]",
    especificaciones: "[]",
    caracteristicas: "[]",
    aplicaciones: "[]",
    compatibilidad: "[]",
    tags: "[]",
    activo: true,
    destacado: false,
    destacadoRepuesto: true,
    nuevo: false,
    disponible: true,
  },
  categorias: { nombre: "", slug: "", descripcion: "", icono: "Flame", imagen: "", color: "#C41E2A", orden: 0, activo: true },
  servicios: { nombre: "", slug: "", descripcion: "", descripcionLarga: "", icono: "Wrench", imagen: "", caracteristicas: "[]", orden: 0, activo: true },
  proyectos: { titulo: "", slug: "", descripcion: "", cliente: "", ubicacion: "", categoria: "Instalación", imagenes: "[]", destacado: false, activo: true, orden: 0 },
  banners: { titulo: "", subtitulo: "", descripcion: "", ctaTexto: "", ctaLink: "", ctaTipo: "link", imagenDesktop: "", imagenMobile: "", posicion: "hero", activo: true, orden: 0, overlay: true, overlayOpacity: 0.5 },
  marcas: { nombre: "", logo: "", url: "", orden: 0, activo: true },
  cotizaciones: { nombre: "", telefono: "", email: "", mensaje: "", fuente: "whatsapp", estado: "nuevo", notas: "" },
  testimonios: { nombre: "", empresa: "", cargo: "", mensaje: "", rating: 5, imagen: "", activo: true, orden: 0 },
  faqs: { pregunta: "", respuesta: "", categoria: "general", orden: 0, activo: true },
  usuarios: { nombre: "", email: "", password: "", rol: "admin", activo: true },
  configuracion: { clave: "", valor: "", tipo: "string", grupo: "general", label: "" },
  leads: { nombre: "", telefono: "", email: "", consulta: "", fuente: "contacto", estado: "nuevo" },
  reclamaciones: {
    nombre: "",
    documento: "",
    telefono: "",
    email: "",
    direccion: "",
    tipo: "reclamo",
    productoServicio: "",
    monto: "",
    detalle: "",
    pedido: "",
    estado: "nuevo",
  },
};

export default function AdminPage() {
  const router = useRouter();
  const [active, setActive] = useState<ResourceKey>("productos");
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [total, setTotal] = useState(0);
  const [summary, setSummary] = useState<Record<string, unknown>>({});
  const [selected, setSelected] = useState<Record<string, unknown>>(templates.productos);
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Record<string, unknown>[]>([]);

  const fields = useMemo(() => Object.keys(templates[active]), [active]);

  const load = useCallback(async () => {
    setLoading(true);
    const response = await fetch(`/api/admin/${active}${query ? `?q=${encodeURIComponent(query)}` : ""}`);
    if (response.status === 401) {
      router.push("/admin/login");
      return;
    }
    const payload = await response.json();
    const data = payload.data as ApiList;
    setItems(data?.items || []);
    setTotal(data?.total || 0);
    setSelected(templates[active]);
    setLoading(false);
  }, [active, query, router]);

  useEffect(() => {
    const timer = setTimeout(() => {
      load();
      fetch("/api/admin/reportes/resumen").then((res) => res.json()).then((json) => setSummary(json.data || {}));
      fetch("/api/admin/categorias").then((res) => res.json()).then((json) => setCategories(json.data?.items || []));
    }, 0);
    return () => clearTimeout(timer);
  }, [load]);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    const id = selected.id;
    const response = await fetch(id ? `/api/admin/${active}/${id}` : `/api/admin/${active}`, {
      method: id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(selected),
    });
    const payload = await response.json();
    if (!response.ok) {
      setMessage(payload.message || "No se pudo guardar.");
      return;
    }
    setMessage("Guardado correctamente.");
    await load();
  }

  async function remove(id: unknown) {
    if (!id || !confirm("¿Eliminar este registro?")) return;
    await fetch(`/api/admin/${active}/${id}`, { method: "DELETE" });
    await load();
  }

  async function logout() {
    await fetch("/api/admin/auth/logout", { method: "POST" });
    router.push("/admin/login");
  }

  async function upload(event: ChangeEvent<HTMLInputElement>, field: string) {
    const file = event.target.files?.[0];
    if (!file) return;
    const form = new FormData();
    form.set("file", file);
    form.set("folder", active);
    const response = await fetch("/api/upload", { method: "POST", body: form });
    const payload = await response.json();
    if (response.ok) {
      setSelected((current) => ({ ...current, [field]: payload.data.url }));
    } else {
      setMessage(payload.message || "No se pudo subir el archivo.");
    }
  }

  return (
    <main className="min-h-screen bg-neutral-100 text-neutral-950">
      <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-neutral-200 bg-black p-5 text-white lg:block">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-red-300">Tecnova</p>
        <h1 className="mt-2 text-3xl font-black">Panel administrativo</h1>
        <nav className="mt-8 space-y-2">
          {modules.map((mod) => {
            const Icon = mod.icon;
            return (
              <button
                key={mod.key}
                onClick={() => setActive(mod.key)}
                className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-black transition ${
                  active === mod.key ? "bg-tecnova-red text-white" : "text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon size={18} />
                {mod.label}
              </button>
            );
          })}
        </nav>
      </aside>

      <section className="lg:pl-72">
        <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white/90 px-4 py-4 backdrop-blur lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-tecnova-red">Tecnova Perú</p>
              <h2 className="text-2xl font-black tracking-[-0.04em]">{modules.find((mod) => mod.key === active)?.label}</h2>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setSelected(templates[active])} className="inline-flex items-center gap-2 rounded-2xl bg-black px-4 py-3 text-sm font-black text-white">
                <Plus size={17} /> Nuevo
              </button>
              <button onClick={logout} className="inline-flex items-center gap-2 rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm font-black">
                <LogOut size={17} /> Salir
              </button>
            </div>
          </div>
        </header>

        <div className="grid gap-5 p-4 lg:grid-cols-[1fr_420px] lg:p-8">
          <div className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-4">
              {["productos", "repuestos", "cotizaciones", "leads"].map((key) => (
                <div key={key} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-tecnova-red">{key}</p>
                  <p className="mt-2 text-3xl font-black">{String(summary[key] || 0)}</p>
                </div>
              ))}
            </div>

            <div className="rounded-[24px] bg-white p-4 shadow-sm ring-1 ring-black/5">
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  load();
                }}
                className="mb-4 flex gap-2"
              >
                <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar..." className="h-11 min-w-0 flex-1 rounded-2xl border border-neutral-200 px-4 text-sm outline-none" />
                <button className="grid h-11 w-11 place-items-center rounded-2xl bg-black text-white">
                  <Search size={18} />
                </button>
              </form>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[680px] text-left text-sm">
                  <thead className="text-xs uppercase tracking-[0.12em] text-neutral-500">
                    <tr>
                      <th className="py-3">Registro</th>
                      <th className="py-3">Estado</th>
                      <th className="py-3">Fecha</th>
                      <th className="py-3 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {items.map((item) => (
                      <tr key={String(item.id)}>
                        <td className="py-4 font-bold">{recordTitle(item)}</td>
                        <td className="py-4">{String(item.activo ?? item.estado ?? "activo")}</td>
                        <td className="py-4 text-neutral-500">{formatDate(item.createdAt)}</td>
                        <td className="py-4">
                          <div className="flex justify-end gap-2">
                            <button onClick={() => setSelected(item)} className="rounded-xl bg-neutral-100 px-3 py-2 font-bold">Editar</button>
                            <button onClick={() => remove(item.id)} className="grid h-9 w-9 place-items-center rounded-xl bg-red-50 text-tecnova-red">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-4 text-sm font-bold text-neutral-500">{loading ? "Cargando..." : `${total} registros`}</p>
            </div>
          </div>

          <form onSubmit={save} className="rounded-[24px] bg-white p-5 shadow-sm ring-1 ring-black/5 lg:sticky lg:top-24 lg:self-start">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-tecnova-red">Formulario</p>
            <h3 className="mt-2 text-2xl font-black tracking-[-0.04em]">{selected.id ? "Editar registro" : "Nuevo registro"}</h3>
            <div className="mt-5 space-y-4">
              {(active === "productos" || active === "repuestos") && (
                <label className="block text-sm font-bold">
                  Categoría
                  <select value={String(selected.categoryId || "")} onChange={(event) => setSelected((current) => ({ ...current, categoryId: event.target.value }))} className="mt-2 h-11 w-full rounded-2xl border border-neutral-200 px-3">
                    <option value="">Seleccionar</option>
                    {categories.map((category) => (
                      <option key={String(category.id)} value={String(category.id)}>{String(category.nombre)}</option>
                    ))}
                  </select>
                </label>
              )}

              {fields.filter((field) => field !== "categoryId").map((field) => (
                <Field
                  key={field}
                  field={field}
                  value={selected[field]}
                  onChange={(value) => setSelected((current) => ({ ...current, [field]: value }))}
                  onUpload={(event) => upload(event, field)}
                />
              ))}
            </div>
            {message && <p className="mt-4 rounded-2xl bg-neutral-100 p-3 text-sm font-bold">{message}</p>}
            <button className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-tecnova-red text-sm font-black text-white transition hover:bg-red-700">
              <Save size={17} /> Guardar cambios
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}

function Field({
  field,
  value,
  onChange,
  onUpload,
}: {
  field: string;
  value: unknown;
  onChange: (value: unknown) => void;
  onUpload: (event: ChangeEvent<HTMLInputElement>) => void;
}) {
  const isBoolean = typeof value === "boolean";
  const isLong = [
    "descripcionLarga",
    "descripcion",
    "mensaje",
    "consulta",
    "detalle",
    "pedido",
    "notas",
    "respuesta",
    "especificaciones",
    "caracteristicas",
    "aplicaciones",
    "compatibilidad",
    "imagenes",
    "tags",
  ].includes(field);
  const isUpload = field.toLowerCase().includes("imagen") || field === "logo";

  if (isBoolean) {
    return (
      <label className="flex items-center justify-between rounded-2xl border border-neutral-200 px-4 py-3 text-sm font-bold">
        {label(field)}
        <input type="checkbox" checked={Boolean(value)} onChange={(event) => onChange(event.target.checked)} />
      </label>
    );
  }

  return (
    <label className="block text-sm font-bold">
      {label(field)}
      {isLong ? (
        <textarea value={String(value ?? "")} onChange={(event) => onChange(event.target.value)} className="mt-2 min-h-24 w-full rounded-2xl border border-neutral-200 px-4 py-3 outline-none" />
      ) : (
        <input value={String(value ?? "")} onChange={(event) => onChange(event.target.value)} className="mt-2 h-11 w-full rounded-2xl border border-neutral-200 px-4 outline-none" />
      )}
      {isUpload && (
        <span className="mt-2 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-neutral-100 px-3 py-2 text-xs font-black">
          <Upload size={14} /> Subir archivo
          <input type="file" onChange={onUpload} className="hidden" />
        </span>
      )}
    </label>
  );
}

function label(field: string) {
  return field.replace(/([A-Z])/g, " $1").replace(/^./, (letter) => letter.toUpperCase());
}

function recordTitle(item: Record<string, unknown>) {
  return String(item.nombre || item.titulo || item.pregunta || item.email || item.clave || item.id);
}

function formatDate(value: unknown) {
  if (!value) return "-";
  return new Date(String(value)).toLocaleDateString("es-PE");
}
