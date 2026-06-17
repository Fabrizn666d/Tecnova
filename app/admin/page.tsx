"use client";

import {
  BarChart3,
  Boxes,
  CircleHelp,
  ClipboardList,
  ExternalLink,
  FileWarning,
  FolderKanban,
  ImageIcon,
  Layers,
  Loader2,
  LogOut,
  Menu,
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
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";

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

type PanelKey = "dashboard" | ResourceKey;

type ApiList = {
  items: Record<string, unknown>[];
  total: number;
};

type AdminProfile = {
  id: string;
  nombre: string;
  email: string;
  rol: "SUPER_ADMIN" | "ADMIN" | "EDITOR";
};

type FieldConfig = {
  key: string;
  label: string;
  tooltip: string;
  type?: "text" | "textarea" | "number" | "email" | "url" | "password" | "select" | "checkbox" | "upload";
  options?: readonly (readonly [string, string])[];
};

const modules: { key: PanelKey; label: string; icon: React.ComponentType<{ size?: number }> }[] = [
  { key: "dashboard", label: "Dashboard", icon: BarChart3 },
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

const moduleSections: { title: string; keys: PanelKey[] }[] = [
  { title: "Inicio", keys: ["dashboard"] },
  { title: "Contenido", keys: ["productos", "repuestos", "categorias", "marcas", "servicios", "proyectos", "banners", "faqs"] },
  { title: "Gestión", keys: ["cotizaciones", "leads", "reclamaciones"] },
  { title: "Sistema", keys: ["usuarios", "configuracion"] },
];

const requestResources = ["cotizaciones", "leads", "reclamaciones"] as const;
const requestStatuses = [
  ["nuevo", "Nuevo"],
  ["en_proceso", "En proceso"],
  ["contactado", "Contactado"],
  ["cerrado", "Cerrado"],
] as const;

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
    precio: "",
    precioAnterior: "",
    moneda: "PEN",
    mostrarPrecio: false,
    etiquetaPrecio: "Consultar precio",
    imagenPrincipal: "",
    imagenes: "[]",
    videoUrl: "",
    mostrarVideo: false,
    especificaciones: "[]",
    caracteristicas: "[]",
    aplicaciones: "[]",
    tags: "[]",
    activo: true,
    destacado: false,
    destacadoRepuesto: false,
    nuevo: false,
    disponible: true,
    seoTitulo: "",
    seoDesc: "",
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
    precio: "",
    precioAnterior: "",
    moneda: "PEN",
    mostrarPrecio: false,
    etiquetaPrecio: "Consultar precio",
    imagenPrincipal: "",
    imagenes: "[]",
    videoUrl: "",
    mostrarVideo: false,
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
    seoTitulo: "",
    seoDesc: "",
  },
  categorias: { nombre: "", slug: "", descripcion: "", icono: "Flame", imagen: "", color: "#C41E2A", orden: 0, activo: true },
  servicios: { nombre: "", slug: "", descripcion: "", descripcionLarga: "", icono: "Wrench", imagen: "", caracteristicas: "[]", orden: 0, activo: true },
  proyectos: { titulo: "", slug: "", descripcion: "", cliente: "", ubicacion: "", categoria: "Instalación", imagenes: "[]", destacado: false, activo: true, orden: 0 },
  banners: { titulo: "", subtitulo: "", descripcion: "", ctaTexto: "", ctaLink: "", ctaTipo: "link", ctaTexto2: "", ctaLink2: "", imagenDesktop: "", imagenMobile: "", posicion: "hero", activo: true, orden: 0, overlay: true, overlayOpacity: 0.5 },
  marcas: { nombre: "", logo: "", url: "", orden: 0, activo: true },
  cotizaciones: { nombre: "", telefono: "", email: "", mensaje: "", fuente: "whatsapp", estado: "nuevo", notas: "" },
  testimonios: { nombre: "", empresa: "", cargo: "", mensaje: "", rating: 5, imagen: "", activo: true, orden: 0 },
  faqs: { pregunta: "", respuesta: "", categoria: "general", orden: 0, activo: true },
  usuarios: { nombre: "", email: "", password: "", rol: "ADMIN", activo: true },
  configuracion: {},
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

const productAdvancedFields: FieldConfig[] = [
  { key: "slug", label: "Slug", tooltip: "Parte final de la URL. Se genera solo desde el nombre." },
  { key: "codigoRef", label: "SKU", tooltip: "Código interno del producto o repuesto." },
  { key: "modelo", label: "Modelo", tooltip: "Modelo del equipo, repuesto o componente." },
  {
    key: "condicion",
    label: "Condición",
    tooltip: "Estado comercial del producto.",
    type: "select",
    options: [["nuevo", "Nuevo"], ["usado", "Usado"], ["reacondicionado", "Reacondicionado"]],
  },
  { key: "tags", label: "Tags", tooltip: "Palabras para búsqueda. Puedes separarlas por coma o una por línea.", type: "textarea" },
  { key: "especificaciones", label: "Especificaciones", tooltip: "Usa líneas tipo Potencia: 2HP o deja JSON si ya lo usas.", type: "textarea" },
  { key: "caracteristicas", label: "Características", tooltip: "Puntos visibles en ficha. Una por línea.", type: "textarea" },
  { key: "aplicaciones", label: "Aplicaciones", tooltip: "Usos recomendados. Uno por línea.", type: "textarea" },
  { key: "videoUrl", label: "URL de video", tooltip: "Link externo de TikTok, YouTube, Instagram u otra plataforma." },
  { key: "mostrarVideo", label: "Mostrar video", tooltip: "Si está activo y hay URL, aparece el botón Ver video en la ficha.", type: "checkbox" },
  { key: "ordenDestacado", label: "Orden de visualización", tooltip: "Número menor aparece primero en destacados.", type: "number" },
  { key: "destacado", label: "Destacado", tooltip: "Muestra el producto en bloques destacados.", type: "checkbox" },
  { key: "nuevo", label: "Nuevo", tooltip: "Marca el producto como novedad.", type: "checkbox" },
  { key: "seoTitulo", label: "SEO título", tooltip: "Título sugerido para Google." },
  { key: "seoDesc", label: "SEO descripción", tooltip: "Resumen corto para resultados de búsqueda.", type: "textarea" },
];

const visualProductFields = new Set(["tags", "especificaciones", "caracteristicas", "aplicaciones"]);

const technicalTemplates: Record<string, string[]> = {
  Horno: ["Capacidad", "Bandejas", "Temperatura", "Voltaje", "Potencia", "Medidas", "Material", "Combustible", "Sistema de vapor"],
  Laminadora: ["Ancho de laminado", "Espesor", "Voltaje", "Potencia", "Peso", "Medidas"],
  Amasadora: ["Capacidad", "Litros", "Voltaje", "Potencia", "Peso", "Medidas", "Velocidades"],
  Batidora: ["Capacidad", "Litros", "Voltaje", "Potencia", "Velocidades", "Peso", "Medidas"],
  Rebanadora: ["Capacidad", "Cantidad de cortes", "Espesor de corte", "Voltaje", "Potencia", "Peso", "Medidas"],
  Divisora: ["Capacidad", "Divisiones", "Rango de gramaje", "Voltaje", "Potencia", "Peso", "Medidas"],
  Prensa: ["Capacidad", "Diámetro", "Presión", "Voltaje", "Potencia", "Peso", "Medidas"],
};

const configGroups: { title: string; fields: FieldConfig[] }[] = [
  {
    title: "Empresa",
    fields: [
      { key: "empresa_nombre", label: "Nombre empresa", tooltip: "Nombre público mostrado en la web." },
      { key: "razon_social", label: "Razón social", tooltip: "Nombre legal para datos comerciales." },
      { key: "ruc", label: "RUC", tooltip: "RUC de la empresa." },
      { key: "direccion", label: "Dirección", tooltip: "Dirección física o zona de atención." },
      { key: "horario", label: "Horario", tooltip: "Horario comercial visible para clientes." },
    ],
  },
  {
    title: "Contacto",
    fields: [
      { key: "telefono", label: "Teléfono", tooltip: "Teléfono principal de contacto." },
      { key: "whatsapp", label: "WhatsApp", tooltip: "Número con código de país, sin espacios. Ejemplo: 51999999999." },
      { key: "whatsapp_display", label: "WhatsApp visible", tooltip: "Texto legible para mostrar el número." },
      { key: "email", label: "Correo", tooltip: "Correo principal para formularios y footer.", type: "email" },
      { key: "google_maps_url", label: "Google Maps URL", tooltip: "Enlace público de Google Maps.", type: "url" },
      { key: "google_maps_embed", label: "Google Maps embed", tooltip: "URL de inserción del mapa.", type: "url" },
    ],
  },
  {
    title: "Identidad visual",
    fields: [
      { key: "logo_principal", label: "Logo principal", tooltip: "Logo usado en cabecera.", type: "upload" },
      { key: "logo_footer", label: "Logo footer", tooltip: "Logo usado en pie de página.", type: "upload" },
      { key: "favicon", label: "Favicon", tooltip: "Ícono del navegador.", type: "upload" },
      { key: "libro_imagen", label: "Imagen libro", tooltip: "Imagen del Libro de Reclamaciones.", type: "upload" },
    ],
  },
  {
    title: "Redes sociales",
    fields: [
      { key: "facebook_url", label: "Facebook", tooltip: "URL de Facebook.", type: "url" },
      { key: "instagram_url", label: "Instagram", tooltip: "URL de Instagram.", type: "url" },
      { key: "tiktok_url", label: "TikTok", tooltip: "URL de TikTok.", type: "url" },
      { key: "youtube_url", label: "YouTube", tooltip: "URL de YouTube.", type: "url" },
      { key: "linkedin_url", label: "LinkedIn", tooltip: "URL de LinkedIn.", type: "url" },
    ],
  },
  {
    title: "Página Nosotros",
    fields: [
      { key: "nosotros_titulo", label: "Título principal", tooltip: "Título visible en la página Nosotros." },
      { key: "nosotros_subtitulo", label: "Subtítulo", tooltip: "Resumen inicial de la empresa.", type: "textarea" },
      { key: "nosotros_historia", label: "Historia", tooltip: "Texto principal de historia y enfoque.", type: "textarea" },
      { key: "nosotros_mision", label: "Misión", tooltip: "Declaración de misión.", type: "textarea" },
      { key: "nosotros_vision", label: "Visión", tooltip: "Declaración de visión.", type: "textarea" },
      { key: "nosotros_valores", label: "Valores", tooltip: "Un valor por línea.", type: "textarea" },
      { key: "nosotros_imagen", label: "Imagen principal", tooltip: "Imagen destacada de la página Nosotros.", type: "upload" },
      { key: "nosotros_stat_1_label", label: "Estadística 1 etiqueta", tooltip: "Texto de la primera estadística." },
      { key: "nosotros_stat_1_value", label: "Estadística 1 valor", tooltip: "Valor visible. Déjalo vacío para usar el conteo automático." },
      { key: "nosotros_stat_2_label", label: "Estadística 2 etiqueta", tooltip: "Texto de la segunda estadística." },
      { key: "nosotros_stat_2_value", label: "Estadística 2 valor", tooltip: "Valor visible. Déjalo vacío para usar el conteo automático." },
      { key: "nosotros_stat_3_label", label: "Estadística 3 etiqueta", tooltip: "Texto de la tercera estadística." },
      { key: "nosotros_stat_3_value", label: "Estadística 3 valor", tooltip: "Valor visible. Déjalo vacío para usar el conteo automático." },
    ],
  },
  {
    title: "SEO",
    fields: [
      { key: "seo_titulo", label: "SEO título", tooltip: "Título principal del sitio." },
      { key: "seo_descripcion", label: "SEO descripción", tooltip: "Descripción general del sitio.", type: "textarea" },
    ],
  },
  {
    title: "Footer",
    fields: [
      { key: "copyright_texto", label: "Texto copyright", tooltip: "Texto inferior izquierdo del footer." },
      { key: "designer_texto", label: "Texto diseñador", tooltip: "Texto inferior derecho del footer. Ejemplo: Designed and developed by Fabrizio Apaza." },
      { key: "footer_descripcion", label: "Descripcion footer", tooltip: "Texto descriptivo principal del pie de pagina.", type: "textarea" },
      { key: "legal_libro_label", label: "Legal 1 texto", tooltip: "Texto del enlace legal del footer." },
      { key: "legal_libro_url", label: "Legal 1 URL", tooltip: "Ruta o enlace del aviso legal.", type: "url" },
      { key: "legal_privacidad_label", label: "Legal 2 texto", tooltip: "Texto del enlace legal del footer." },
      { key: "legal_privacidad_url", label: "Legal 2 URL", tooltip: "Ruta o enlace del aviso legal.", type: "url" },
      { key: "legal_cookies_label", label: "Legal 3 texto", tooltip: "Texto del enlace legal del footer." },
      { key: "legal_cookies_url", label: "Legal 3 URL", tooltip: "Ruta o enlace del aviso legal.", type: "url" },
      { key: "legal_terminos_label", label: "Legal 4 texto", tooltip: "Texto del enlace legal del footer." },
      { key: "legal_terminos_url", label: "Legal 4 URL", tooltip: "Ruta o enlace del aviso legal.", type: "url" },
      { key: "legal_aviso_label", label: "Legal 5 texto", tooltip: "Texto del enlace legal del footer." },
      { key: "legal_aviso_url", label: "Legal 5 URL", tooltip: "Ruta o enlace del aviso legal.", type: "url" },
      { key: "legal_cambios_label", label: "Legal 6 texto", tooltip: "Texto del enlace legal del footer." },
      { key: "legal_cambios_url", label: "Legal 6 URL", tooltip: "Ruta o enlace del aviso legal.", type: "url" },
    ],
  },
];

export default function AdminPage() {
  const router = useRouter();
  const [admin, setAdmin] = useState<AdminProfile | null>(null);
  const [active, setActive] = useState<PanelKey>("dashboard");
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [total, setTotal] = useState(0);
  const [summary, setSummary] = useState<Record<string, unknown>>({});
  const [selected, setSelected] = useState<Record<string, unknown>>({});
  const selectedRef = useRef<Record<string, unknown>>({});
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingField, setUploadingField] = useState("");
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [uploadPreviews, setUploadPreviews] = useState<Record<string, string>>({});
  const [categories, setCategories] = useState<Record<string, unknown>[]>([]);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const isSuperAdmin = admin?.rol === "SUPER_ADMIN";
  const visibleModules = useMemo(
    () => modules.filter((mod) => mod.key !== "usuarios" || isSuperAdmin),
    [isSuperAdmin]
  );
  const activeResource = active === "dashboard" ? null : active;
  const fields = useMemo(() => (activeResource ? Object.keys(templates[activeResource]) : []), [activeResource]);

  const updateSelected = useCallback((next: Record<string, unknown> | ((current: Record<string, unknown>) => Record<string, unknown>)) => {
    setSelected((current) => {
      const resolved = typeof next === "function" ? next(current) : next;
      selectedRef.current = resolved;
      return resolved;
    });
  }, []);

  const loadCategories = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/categorias");
      const payload = await safeJson(response);
      if (response.ok && payload.ok) setCategories(payload.data?.items || []);
    } catch {
      setCategories([]);
    }
  }, []);

  const refreshSummary = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/reportes/resumen");
      if (response.status === 401) {
        router.push("/admin/login");
        return;
      }
      const payload = await safeJson(response);
      if (response.ok) setSummary(payload.data || {});
    } catch {
      setSummary({});
    }
  }, [router]);

  const load = useCallback(async () => {
    if (active === "dashboard") {
      setItems([]);
      setTotal(0);
      updateSelected({});
      await refreshSummary();
      return;
    }

    setLoading(true);
    setMessage("");
    try {
      const response = await fetch(`/api/admin/${active}${query ? `?q=${encodeURIComponent(query)}` : ""}`);
      if (response.status === 401) {
        router.push("/admin/login");
        return;
      }
      const payload = await safeJson(response);
      if (!response.ok || !payload.ok) {
        setItems([]);
        setTotal(0);
        setMessage(payload.message || "No se pudo cargar la sección.");
        return;
      }

      const data = payload.data as ApiList;
      setItems(data?.items || []);
      setTotal(data?.total || 0);
      updateSelected(active === "configuracion" ? settingsRowsToForm(data?.items || []) : newTemplate(active));
      setAdvancedOpen(false);
    } catch {
      setMessage("No se pudo conectar con el servidor. Intenta nuevamente.");
      setItems([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [active, query, refreshSummary, router, updateSelected]);

  useEffect(() => {
    let ignore = false;

    async function bootstrap() {
      try {
        const me = await fetch("/api/admin/auth/me");
        if (me.status === 401) {
          router.push("/admin/login");
          return;
        }
        const mePayload = await safeJson(me);
        if (!ignore && me.ok) setAdmin(mePayload.data);

        await Promise.all([loadCategories(), refreshSummary()]);
      } catch {
        if (!ignore) setMessage("No se pudo cargar la sesión del panel.");
      }
    }

    bootstrap();
    return () => {
      ignore = true;
    };
  }, [loadCategories, refreshSummary, router]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      load();
    }, 120);
    return () => window.clearTimeout(timer);
  }, [load]);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!activeResource) return;

    setMessage("");
    setSaving(true);
    try {
      const currentSelected = selectedRef.current;
      const id = currentSelected.id;
      const payload = preparePayload(activeResource, currentSelected);
      const response = await fetch(
        activeResource === "configuracion"
          ? "/api/admin/configuracion"
          : id
            ? `/api/admin/${activeResource}/${id}`
            : `/api/admin/${activeResource}`,
        {
          method: activeResource === "configuracion" ? "PUT" : id ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const result = await safeJson(response);
      if (response.status === 401) {
        setMessage("Tu sesión expiró. Inicia sesión nuevamente.");
        return;
      }
      if (!response.ok || !result.ok) {
        setMessage(result.message || "No se pudo guardar.");
        return;
      }
      setMessage("Guardado correctamente.");
      await Promise.all([
        load(),
        refreshSummary(),
        activeResource === "categorias" ? loadCategories() : Promise.resolve(),
      ]);
    } catch {
      setMessage("No se pudo guardar. Revisa los campos e intenta nuevamente.");
    } finally {
      setSaving(false);
    }
  }

  async function saveConfigGroup(group: { title: string; fields: FieldConfig[] }) {
    setMessage("");
    setSaving(true);
    try {
      const currentSelected = selectedRef.current;
      const payload = Object.fromEntries(
        group.fields
          .map((field) => [field.key, currentSelected[field.key]] as const)
          .filter(([, value]) => typeof value !== "undefined")
      );
      const response = await fetch("/api/admin/configuracion", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await safeJson(response);
      if (response.status === 401) {
        setMessage("Tu sesión expiró. Inicia sesión nuevamente.");
        return;
      }
      if (!response.ok || !result.ok) {
        setMessage(result.message || "No se pudo guardar el bloque.");
        return;
      }
      setMessage(`Cambios guardados correctamente: ${group.title}.`);
      await load();
    } catch {
      setMessage("No se pudo guardar. Revisa los campos e intenta nuevamente.");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: unknown) {
    if (!activeResource || activeResource === "configuracion") return;
    const action = activeResource === "usuarios" ? "desactivar" : "eliminar";
    if (!id || !confirm(`¿Seguro que deseas ${action} este registro?`)) return;

    setMessage("");
    try {
      const response = await fetch(`/api/admin/${activeResource}/${id}`, { method: "DELETE" });
      const payload = await safeJson(response);
      if (response.status === 401) {
        setMessage("Tu sesión expiró. Inicia sesión nuevamente.");
        return;
      }
      if (!response.ok || !payload.ok) {
        setMessage(payload.message || `No se pudo ${action} el registro.`);
        return;
      }
      await Promise.all([
        load(),
        refreshSummary(),
        activeResource === "categorias" ? loadCategories() : Promise.resolve(),
      ]);
      setMessage(activeResource === "usuarios" ? "Usuario desactivado." : "Registro eliminado.");
    } catch {
      setMessage("No se pudo completar la acción.");
    }
  }

  async function logout() {
    await fetch("/api/admin/auth/logout", { method: "POST" }).catch(() => null);
    router.push("/admin/login");
  }

  async function upload(event: ChangeEvent<HTMLInputElement>, field: string) {
    const files = Array.from(event.currentTarget.files || []);
    event.currentTarget.value = "";
    if (files.length === 0 || !activeResource) return;

    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (files.some((file) => file.type === "image/heic" || file.type === "image/heif")) {
      setMessage("Formato HEIC/HEIF no compatible. Usa JPG, PNG o WebP.");
      return;
    }
    if (files.some((file) => !allowed.includes(file.type))) {
      setMessage("Formato no permitido. Usa JPG, JPEG, PNG o WebP.");
      return;
    }
    if (files.some((file) => file.size > 10 * 1024 * 1024)) {
      setMessage("La imagen no debe superar 10MB.");
      return;
    }

    const previewUrl = URL.createObjectURL(files[0]);
    setUploadPreviews((current) => ({ ...current, [field]: previewUrl }));
    setUploadingField(field);
    setMessage("");

    try {
      const urls: string[] = [];
      for (const file of files) {
        const form = new FormData();
        form.set("file", file);
        form.set("folder", activeResource);
        const response = await fetch("/api/upload", { method: "POST", body: form });
        const payload = await safeJson(response);
        if (response.status === 401) {
          setMessage("Tu sesión expiró. Inicia sesión nuevamente.");
          return;
        }
        if (!response.ok || !payload.ok) {
          setMessage(payload.message || "No se pudo subir la imagen.");
          return;
        }
        urls.push(String(payload.data.url || ""));
      }

      updateSelected((current) => {
        const next = updateImageField(current, field, urls);
        return next;
      });
      setUploadPreviews((current) => ({ ...current, [field]: urls[0] || "" }));
      setMessage(files.length > 1 ? "Imagenes subidas. Recuerda guardar los cambios." : "Imagen subida. Recuerda guardar los cambios.");
    } catch {
      setMessage("No se pudo subir la imagen.");
    } finally {
      setUploadingField("");
    }
  }

  function editItem(item: Record<string, unknown>) {
    if (!activeResource) return;
    setMessage("");
    setAdvancedOpen(false);
    updateSelected(normalizeSelected(activeResource, item));
  }

  function startNew() {
    if (!activeResource || activeResource === "configuracion") return;
    setMessage("");
    setAdvancedOpen(false);
    updateSelected(newTemplate(activeResource));
  }

  const title = modules.find((mod) => mod.key === active)?.label || "Dashboard";

  return (
    <main className="min-h-screen bg-neutral-100 text-neutral-950">
      <aside className="fixed inset-y-0 left-0 hidden w-72 overflow-y-auto border-r border-neutral-800 bg-black p-5 text-white lg:block">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-red-300">Tecnova</p>
        <h1 className="mt-2 text-3xl font-black">Panel administrativo</h1>
        <nav className="mt-8 space-y-6">
          {moduleSections.map((section) => {
            const sectionModules = visibleModules.filter((mod) => section.keys.includes(mod.key));
            if (sectionModules.length === 0) return null;
            return (
              <div key={section.title}>
                <p className="mb-2 px-4 text-[10px] font-black uppercase tracking-[0.18em] text-white/35">{section.title}</p>
                <div className="space-y-2">
                  {sectionModules.map((mod) => {
                    const Icon = mod.icon;
                    return (
                      <button
                        key={mod.key}
                        type="button"
                        onClick={() => setActive(mod.key)}
                        className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-black transition ${
                          active === mod.key ? "bg-tecnova-red text-white" : "text-white/70 hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        <Icon size={18} />
                        {mod.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>
      </aside>

      {mobileNavOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 lg:hidden" role="dialog" aria-modal="true">
          <aside className="h-full w-[min(88vw,320px)] overflow-y-auto bg-black p-5 text-white shadow-lift">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-red-300">Tecnova</p>
                <h1 className="mt-2 text-2xl font-black">Panel administrativo</h1>
              </div>
              <button type="button" onClick={() => setMobileNavOpen(false)} className="grid h-10 w-10 place-items-center rounded-lg bg-white/10" aria-label="Cerrar menu">
                <X size={18} />
              </button>
            </div>
            <nav className="mt-8 space-y-6">
              {moduleSections.map((section) => {
                const sectionModules = visibleModules.filter((mod) => section.keys.includes(mod.key));
                if (sectionModules.length === 0) return null;
                return (
                  <div key={section.title}>
                    <p className="mb-2 px-4 text-[10px] font-black uppercase tracking-[0.18em] text-white/35">{section.title}</p>
                    <div className="space-y-2">
                      {sectionModules.map((mod) => {
                        const Icon = mod.icon;
                        return (
                          <button
                            key={mod.key}
                            type="button"
                            onClick={() => {
                              setActive(mod.key);
                              setMobileNavOpen(false);
                            }}
                            className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-black transition ${
                              active === mod.key ? "bg-tecnova-red text-white" : "text-white/70 hover:bg-white/10 hover:text-white"
                            }`}
                          >
                            <Icon size={18} />
                            {mod.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </nav>
          </aside>
        </div>
      )}

      <section className="lg:pl-72">
        <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white/90 px-4 py-4 backdrop-blur lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-tecnova-red">Tecnova Perú</p>
              <h2 className="text-2xl font-black tracking-[-0.04em]">{title}</h2>
              {admin && <p className="mt-1 text-sm font-bold text-neutral-500">Bienvenido, {admin.nombre}</p>}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button type="button" onClick={() => setMobileNavOpen(true)} className="inline-grid h-11 w-11 place-items-center rounded-lg bg-black text-white lg:hidden" aria-label="Abrir menu">
                <Menu size={18} />
              </button>
              <a href="/" target="_blank" rel="noreferrer" className="inline-flex h-11 items-center gap-2 rounded-lg border border-neutral-200 bg-white px-4 text-sm font-black">
                <ExternalLink size={17} /> Ver sitio web
              </a>
              <select
                value={active}
                onChange={(event) => setActive(event.target.value as PanelKey)}
                className="h-11 rounded-lg border border-neutral-200 bg-white px-3 text-sm font-black outline-none lg:hidden"
                aria-label="Sección del panel"
              >
                {visibleModules.map((mod) => (
                  <option key={mod.key} value={mod.key}>{mod.label}</option>
                ))}
              </select>
              {activeResource && activeResource !== "configuracion" && !isRequestResource(activeResource) && (
                <button type="button" onClick={startNew} className="inline-flex items-center gap-2 rounded-lg bg-black px-4 py-3 text-sm font-black text-white">
                  <Plus size={17} /> Nuevo
                </button>
              )}
              <button type="button" onClick={logout} className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-4 py-3 text-sm font-black">
                <LogOut size={17} /> Salir
              </button>
            </div>
          </div>
        </header>

        {active === "dashboard" ? (
          <Dashboard summary={summary} loading={loading} />
        ) : (
          <div className={`grid gap-5 p-4 lg:p-8 ${active === "configuracion" ? "xl:grid-cols-[1fr]" : "xl:grid-cols-[1fr_460px]"}`}>
            <section className="space-y-5">
              {active !== "configuracion" && (
                <div className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-black/5">
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.14em] text-tecnova-red">{title}</p>
                      <p className="mt-1 text-sm font-bold text-neutral-500">{loading ? "Cargando..." : `${total} registros relacionados`}</p>
                    </div>
                    <form
                      onSubmit={(event) => {
                        event.preventDefault();
                        load();
                      }}
                      className="flex min-w-[240px] flex-1 gap-2 sm:max-w-md"
                    >
                      <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar..." className="h-11 min-w-0 flex-1 rounded-lg border border-neutral-200 px-4 text-sm outline-none focus:border-tecnova-red" />
                      <button className="grid h-11 w-11 place-items-center rounded-lg bg-black text-white" aria-label="Buscar">
                        <Search size={18} />
                      </button>
                    </form>
                  </div>

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
                        {loading && (
                          <tr>
                            <td colSpan={4} className="py-8 text-center text-sm font-bold text-neutral-500">
                              <span className="inline-flex items-center gap-2"><Loader2 className="animate-spin" size={16} /> Cargando registros...</span>
                            </td>
                          </tr>
                        )}
                        {!loading && items.map((item) => (
                          <tr key={String(item.id)}>
                            <td className="py-4 font-bold">{recordTitle(item)}</td>
                            <td className="py-4"><StatusBadge item={item} /></td>
                            <td className="py-4 text-neutral-500">{formatDate(item.createdAt || item.updatedAt)}</td>
                            <td className="py-4">
                              <div className="flex justify-end gap-2">
                                <button type="button" onClick={() => editItem(item)} className="rounded-lg bg-neutral-100 px-3 py-2 font-bold">
                                  {activeResource && isRequestResource(activeResource) ? "Ver solicitud" : "Editar"}
                                </button>
                                <button type="button" onClick={() => remove(item.id)} className="grid h-9 w-9 place-items-center rounded-lg bg-red-50 text-tecnova-red" aria-label={active === "usuarios" ? "Desactivar" : "Eliminar"}>
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {!loading && items.length === 0 && (
                          <tr>
                            <td colSpan={4} className="py-8 text-center text-sm font-bold text-neutral-500">No hay registros para mostrar.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </section>

            <form onSubmit={save} className="rounded-lg bg-white p-5 shadow-sm ring-1 ring-black/5 xl:sticky xl:top-24 xl:self-start">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-tecnova-red">Formulario</p>
              <h3 className="mt-2 text-2xl font-black tracking-[-0.04em]">
                {activeResource && isRequestResource(activeResource)
                  ? "Ver solicitud"
                  : selected.id
                    ? "Editar registro"
                    : active === "configuracion"
                      ? "Configuración del sitio"
                      : "Nuevo registro"}
              </h3>

              <div className="mt-5">
                {activeResource === "categorias" && (
                  <p className="mb-4 rounded-lg bg-amber-50 p-3 text-sm font-bold text-amber-800">
                    Esta categoría aparecerá en la web cuando tenga productos asociados.
                  </p>
                )}
                {activeResource === "productos" || activeResource === "repuestos" ? (
                  <ProductForm
                    kind={activeResource}
                    selected={selected}
                    categories={categories}
                    advancedOpen={advancedOpen}
                    uploadPreviews={uploadPreviews}
                    uploadingField={uploadingField}
                    onToggleAdvanced={() => setAdvancedOpen((value) => !value)}
                    onChange={(field, value) => updateSelected((current) => changeProductField(current, field, value))}
                    onUpload={upload}
                  />
                ) : activeResource === "configuracion" ? (
                  <ConfigForm
                    selected={selected}
                    uploadPreviews={uploadPreviews}
                    uploadingField={uploadingField}
                    onChange={(field, value) => updateSelected((current) => ({ ...current, [field]: value }))}
                    onUpload={upload}
                    onSaveGroup={saveConfigGroup}
                    saving={saving}
                  />
                ) : activeResource === "usuarios" ? (
                  <UserForm selected={selected} onChange={(field, value) => updateSelected((current) => ({ ...current, [field]: value }))} />
                ) : activeResource && isRequestResource(activeResource) ? (
                  <RequestForm resource={activeResource} selected={selected} onChange={(field, value) => updateSelected((current) => ({ ...current, [field]: value }))} />
                ) : (
                  <GenericForm
                    fields={fields}
                    selected={selected}
                    uploadPreviews={uploadPreviews}
                    uploadingField={uploadingField}
                    onChange={(field, value) => updateSelected((current) => ({ ...current, [field]: value }))}
                    onUpload={upload}
                  />
                )}
              </div>

              {message && <p className="mt-4 rounded-lg bg-neutral-100 p-3 text-sm font-bold">{message}</p>}
              {activeResource !== "configuracion" && (
                <button disabled={saving || !activeResource} className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-tecnova-red text-sm font-black text-white transition hover:bg-red-700 disabled:opacity-60">
                  {saving ? <Loader2 size={17} className="animate-spin" /> : <Save size={17} />} Guardar cambios
                </button>
              )}
            </form>
          </div>
        )}
      </section>
    </main>
  );
}

function Dashboard({ summary, loading }: { summary: Record<string, unknown>; loading: boolean }) {
  const stats = [
    ["Productos", "productos", Boxes],
    ["Repuestos", "repuestos", Settings],
    ["Cotizaciones", "cotizaciones", MessageCircle],
    ["Leads", "leads", ClipboardList],
  ] as const;
  const top = Array.isArray(summary.topProductos) ? summary.topProductos as Record<string, unknown>[] : [];

  return (
    <section className="space-y-5 p-4 lg:p-8">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(([label, key, Icon]) => (
          <div key={key} className="rounded-lg bg-white p-5 shadow-sm ring-1 ring-black/5">
            <div className="flex items-center justify-between">
              <p className="text-xs font-black uppercase tracking-[0.14em] text-tecnova-red">{label}</p>
              <Icon size={19} />
            </div>
            <p className="mt-3 text-3xl font-black">{loading ? "..." : String(summary[key] || 0)}</p>
          </div>
        ))}
      </div>

      <div className="rounded-lg bg-white p-5 shadow-sm ring-1 ring-black/5">
        <p className="text-xs font-black uppercase tracking-[0.14em] text-tecnova-red">Productos con más movimiento</p>
        <div className="mt-4 divide-y divide-neutral-100">
          {top.length === 0 && <p className="py-4 text-sm font-bold text-neutral-500">Sin datos por ahora.</p>}
          {top.map((item) => (
            <div key={String(item.id)} className="grid gap-2 py-3 text-sm sm:grid-cols-[1fr_auto_auto]">
              <p className="font-black">{String(item.nombre || "Producto")}</p>
              <p className="font-bold text-neutral-500">{String(item.vistas || 0)} vistas</p>
              <p className="font-bold text-neutral-500">{String(item.cotizaciones || 0)} cotizaciones</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProductForm({
  kind,
  selected,
  categories,
  advancedOpen,
  uploadPreviews,
  uploadingField,
  onToggleAdvanced,
  onChange,
  onUpload,
}: {
  kind: "productos" | "repuestos";
  selected: Record<string, unknown>;
  categories: Record<string, unknown>[];
  advancedOpen: boolean;
  uploadPreviews: Record<string, string>;
  uploadingField: string;
  onToggleAdvanced: () => void;
  onChange: (field: string, value: unknown) => void;
  onUpload: (event: ChangeEvent<HTMLInputElement>, field: string) => void;
}) {
  return (
    <div className="space-y-4">
      <TextField field="nombre" label="Nombre" tooltip="Nombre comercial visible para el cliente." value={selected.nombre} onChange={onChange} required />
      <label className="block text-sm font-bold">
        <FieldLabel label="Categoría" tooltip="Grupo donde aparecerá en el catálogo." />
        <select value={String(selected.categoryId || "")} onChange={(event) => onChange("categoryId", event.target.value)} className="mt-2 h-11 w-full rounded-lg border border-neutral-200 bg-white px-3 outline-none focus:border-tecnova-red" required>
          <option value="">Seleccionar</option>
          {categories.map((category) => (
            <option key={String(category.id)} value={String(category.id)}>{String(category.nombre)}</option>
          ))}
        </select>
      </label>
      <TextField field="marca" label="Marca" tooltip="Marca del equipo o repuesto." value={selected.marca} onChange={onChange} />
      <div className="grid gap-3 sm:grid-cols-3">
        <TextField field="precio" label="Precio" tooltip="Precio actual. Déjalo vacío si se cotiza por WhatsApp." value={selected.precio} onChange={onChange} type="number" />
        <TextField field="precioAnterior" label="Precio anterior" tooltip="Precio tachado opcional para promociones." value={selected.precioAnterior} onChange={onChange} type="number" />
        <label className="block text-sm font-bold">
          <FieldLabel label="Moneda" tooltip="Moneda usada cuando el precio se muestra." />
          <select value={getCurrency(selected)} onChange={(event) => onChange("moneda", event.target.value)} className="mt-2 h-11 w-full rounded-lg border border-neutral-200 bg-white px-3 outline-none focus:border-tecnova-red">
            <option value="PEN">Soles (PEN)</option>
            <option value="USD">Dólares (USD)</option>
          </select>
        </label>
      </div>
      <UploadField field="imagenPrincipal" label="Imagen principal" tooltip="Foto principal del producto o repuesto." value={selected.imagenPrincipal} preview={uploadPreviews.imagenPrincipal} uploading={uploadingField === "imagenPrincipal"} onUpload={onUpload} />
      <TextField field="descripcionCorta" label="Descripción corta" tooltip="Resumen breve que aparece en tarjetas y ficha." value={selected.descripcionCorta} onChange={onChange} textarea required />
      <ToggleField field="disponible" label="Disponible" tooltip="Activa si puede cotizarse o entregarse actualmente." value={selected.disponible} onChange={onChange} />

      <button type="button" onClick={onToggleAdvanced} className="w-full rounded-lg border border-neutral-200 px-4 py-3 text-sm font-black transition hover:border-tecnova-red hover:text-tecnova-red">
        {advancedOpen ? "Ocultar opciones avanzadas" : "Opciones avanzadas"}
      </button>

      {advancedOpen && (
        <div className="space-y-4 border-t border-neutral-100 pt-4">
          <GalleryField field="imagenes" label="Galeria de imagenes" tooltip="Sube varias imagenes, reordenalas o elimina las que no van en la ficha." value={selected.imagenes} uploading={uploadingField === "imagenes"} onUpload={onUpload} onChange={onChange} />
          <TechnicalSpecsEditor value={selected.especificaciones} onChange={onChange} />
          <StringListEditor field="caracteristicas" label="Características" tooltip="Puntos visibles en la ficha del producto. Agrega una línea por beneficio o atributo." value={selected.caracteristicas} onChange={onChange} placeholder="Acero inoxidable 304" />
          <StringListEditor field="aplicaciones" label="Aplicaciones" tooltip="Usos recomendados del equipo o repuesto." value={selected.aplicaciones} onChange={onChange} placeholder="Panaderias y pastelerias" />
          <StringListEditor field="tags" label="Tags" tooltip="Palabras de búsqueda internas. No uses comas ni corchetes; agrega una por fila." value={selected.tags} onChange={onChange} placeholder="horno industrial" />
          {kind === "repuestos" && (
            <StringListEditor field="compatibilidad" label="Compatibilidad" tooltip="Equipos, modelos o familias compatibles con este repuesto." value={selected.compatibilidad} onChange={onChange} placeholder="Horno rotativo 18 bandejas" />
          )}
          {productAdvancedFields.filter((field) => !visualProductFields.has(field.key)).map((field) => (
            <DynamicField key={field.key} config={field} value={selected[field.key]} onChange={onChange} />
          ))}
          {kind === "repuestos" && (
            <>
              <DynamicField config={{ key: "ordenRepuesto", label: "Orden en repuestos", tooltip: "Número menor aparece primero en repuestos destacados.", type: "number" }} value={selected.ordenRepuesto} onChange={onChange} />
              <DynamicField config={{ key: "destacadoRepuesto", label: "Destacado repuesto", tooltip: "Muestra este repuesto en destacados.", type: "checkbox" }} value={selected.destacadoRepuesto} onChange={onChange} />
            </>
          )}
        </div>
      )}
    </div>
  );
}

function ConfigForm({
  selected,
  uploadPreviews,
  uploadingField,
  onChange,
  onUpload,
  onSaveGroup,
  saving,
}: {
  selected: Record<string, unknown>;
  uploadPreviews: Record<string, string>;
  uploadingField: string;
  onChange: (field: string, value: unknown) => void;
  onUpload: (event: ChangeEvent<HTMLInputElement>, field: string) => void;
  onSaveGroup: (group: { title: string; fields: FieldConfig[] }) => void;
  saving: boolean;
}) {
  return (
    <div className="space-y-7">
      {configGroups.map((group) => (
        <section key={group.title} className="space-y-4 border-b border-neutral-100 pb-5 last:border-0 last:pb-0">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h4 className="text-lg font-black">{group.title}</h4>
            <button
              type="button"
              disabled={saving}
              onClick={() => onSaveGroup(group)}
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-tecnova-red px-4 text-xs font-black text-white transition hover:bg-red-700 disabled:opacity-60"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Guardar {group.title.toLowerCase()}
            </button>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {group.fields.map((field) => (
              field.type === "upload" ? (
                <UploadField key={field.key} field={field.key} label={field.label} tooltip={field.tooltip} value={selected[field.key]} preview={uploadPreviews[field.key]} uploading={uploadingField === field.key} onUpload={onUpload} />
              ) : (
                <DynamicField key={field.key} config={field} value={selected[field.key]} onChange={onChange} />
              )
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function UserForm({
  selected,
  onChange,
}: {
  selected: Record<string, unknown>;
  onChange: (field: string, value: unknown) => void;
}) {
  return (
    <div className="space-y-4">
      <TextField field="nombre" label="Nombre" tooltip="Nombre que se mostrará en el saludo del panel." value={selected.nombre} onChange={onChange} required />
      <TextField field="email" label="Correo" tooltip="Correo único para ingresar al panel." value={selected.email} onChange={onChange} type="email" required />
      <label className="block text-sm font-bold">
        <FieldLabel label="Rol" tooltip="SUPER_ADMIN gestiona usuarios. ADMIN y EDITOR no ven la sección Usuarios." />
        <select value={String(selected.rol || "ADMIN").toUpperCase()} onChange={(event) => onChange("rol", event.target.value)} className="mt-2 h-11 w-full rounded-lg border border-neutral-200 bg-white px-3 outline-none focus:border-tecnova-red">
          <option value="SUPER_ADMIN">SUPER_ADMIN</option>
          <option value="ADMIN">ADMIN</option>
          <option value="EDITOR">EDITOR</option>
        </select>
      </label>
      <TextField field="password" label={selected.id ? "Nueva contraseña" : "Contraseña"} tooltip={selected.id ? "Opcional. Déjalo vacío para conservar la actual." : "Mínimo 8 caracteres."} value={selected.password} onChange={onChange} type="password" required={!selected.id} />
      <ToggleField field="activo" label="Activo" tooltip="Permite o bloquea el acceso al panel." value={selected.activo} onChange={onChange} />
    </div>
  );
}

function RequestForm({
  resource,
  selected,
  onChange,
}: {
  resource: ResourceKey;
  selected: Record<string, unknown>;
  onChange: (field: string, value: unknown) => void;
}) {
  const message = resource === "leads" ? selected.consulta : selected.mensaje || selected.detalle;
  const title = resource === "reclamaciones" ? selected.productoServicio : selected.nombre;
  return (
    <div className="space-y-5">
      <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
        <p className="text-xs font-black uppercase tracking-[0.14em] text-tecnova-red">Solicitud recibida</p>
        <h4 className="mt-2 text-xl font-black">{String(title || "Sin título")}</h4>
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <Info label="Nombre" value={selected.nombre} />
          <Info label="Fecha" value={formatDate(selected.createdAt || selected.updatedAt)} />
          <Info label="Teléfono" value={selected.telefono} />
          <Info label="Email" value={selected.email} />
          {resource === "reclamaciones" && <Info label="Documento" value={selected.documento} />}
          {resource === "reclamaciones" && <Info label="Tipo" value={selected.tipo} />}
          {resource === "reclamaciones" && <Info label="Monto" value={selected.monto} />}
          {resource === "reclamaciones" && <Info label="Dirección" value={selected.direccion} />}
        </dl>
        <div className="mt-4">
          <p className="text-xs font-black uppercase tracking-[0.12em] text-neutral-500">Mensaje</p>
          <p className="mt-2 whitespace-pre-wrap rounded-lg bg-white p-4 text-sm font-semibold leading-6 text-tecnova-steel">{String(message || "Sin mensaje")}</p>
        </div>
        {resource === "reclamaciones" && (
          <div className="mt-4">
            <p className="text-xs font-black uppercase tracking-[0.12em] text-neutral-500">Pedido del consumidor</p>
            <p className="mt-2 whitespace-pre-wrap rounded-lg bg-white p-4 text-sm font-semibold leading-6 text-tecnova-steel">{String(selected.pedido || "Sin pedido")}</p>
          </div>
        )}
      </div>

      <label className="block text-sm font-bold">
        <FieldLabel label="Estado" tooltip="Estado interno para seguimiento del equipo administrativo." />
        <select value={String(selected.estado || "nuevo")} onChange={(event) => onChange("estado", event.target.value)} className="mt-2 h-11 w-full rounded-lg border border-neutral-200 bg-white px-3 outline-none focus:border-tecnova-red">
          {requestStatuses.map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </label>
      <TextField field="notas" label="Notas internas" tooltip="Notas visibles solo para administración." value={selected.notas} onChange={onChange} textarea />
    </div>
  );
}

function Info({ label, value }: { label: string; value: unknown }) {
  return (
    <div>
      <dt className="text-xs font-black uppercase tracking-[0.12em] text-neutral-500">{label}</dt>
      <dd className="mt-1 font-bold text-neutral-900">{String(value || "-")}</dd>
    </div>
  );
}

function GenericForm({
  fields,
  selected,
  uploadPreviews,
  uploadingField,
  onChange,
  onUpload,
}: {
  fields: string[];
  selected: Record<string, unknown>;
  uploadPreviews: Record<string, string>;
  uploadingField: string;
  onChange: (field: string, value: unknown) => void;
  onUpload: (event: ChangeEvent<HTMLInputElement>, field: string) => void;
}) {
  return (
    <div className="space-y-4">
      {fields.map((field) => {
        const value = selected[field];
        if (typeof value === "boolean") {
          return <ToggleField key={field} field={field} label={label(field)} tooltip={tooltip(field)} value={value} onChange={onChange} />;
        }
        if (isUploadField(field)) {
          if (field === "imagenes") {
            return <GalleryField key={field} field={field} label={label(field)} tooltip={tooltip(field)} value={value} uploading={uploadingField === field} onUpload={onUpload} onChange={onChange} />;
          }
          return <UploadField key={field} field={field} label={label(field)} tooltip={tooltip(field)} value={value} preview={uploadPreviews[field]} uploading={uploadingField === field} onUpload={onUpload} />;
        }
        return <TextField key={field} field={field} label={label(field)} tooltip={tooltip(field)} value={value} onChange={onChange} textarea={isLongField(field)} type={isNumericField(field) ? "number" : field === "email" ? "email" : "text"} />;
      })}
    </div>
  );
}

function DynamicField({
  config,
  value,
  onChange,
}: {
  config: FieldConfig;
  value: unknown;
  onChange: (field: string, value: unknown) => void;
}) {
  if (config.type === "checkbox") {
    return <ToggleField field={config.key} label={config.label} tooltip={config.tooltip} value={value} onChange={onChange} />;
  }
  if (config.type === "select") {
    return (
      <label className="block text-sm font-bold">
        <FieldLabel label={config.label} tooltip={config.tooltip} />
        <select value={String(value || "")} onChange={(event) => onChange(config.key, event.target.value)} className="mt-2 h-11 w-full rounded-lg border border-neutral-200 bg-white px-3 outline-none focus:border-tecnova-red">
          {(config.options || []).map(([optionValue, optionLabel]) => (
            <option key={optionValue} value={optionValue}>{optionLabel}</option>
          ))}
        </select>
      </label>
    );
  }
  return (
    <TextField
      field={config.key}
      label={config.label}
      tooltip={config.tooltip}
      value={value}
      onChange={onChange}
      textarea={config.type === "textarea"}
      type={config.type === "number" ? "number" : config.type === "email" ? "email" : config.type === "url" ? "url" : config.type === "password" ? "password" : "text"}
    />
  );
}

function TextField({
  field,
  label,
  tooltip,
  value,
  onChange,
  type = "text",
  textarea = false,
  required = false,
}: {
  field: string;
  label: string;
  tooltip: string;
  value: unknown;
  onChange: (field: string, value: unknown) => void;
  type?: string;
  textarea?: boolean;
  required?: boolean;
}) {
  return (
    <label className="block text-sm font-bold">
      <FieldLabel label={label} tooltip={tooltip} />
      {textarea ? (
        <textarea value={String(value ?? "")} required={required} onChange={(event) => onChange(field, event.target.value)} className="mt-2 min-h-24 w-full rounded-lg border border-neutral-200 px-4 py-3 outline-none focus:border-tecnova-red" />
      ) : (
        <input value={String(value ?? "")} required={required} onChange={(event) => onChange(field, event.target.value)} type={type} className="mt-2 h-11 w-full rounded-lg border border-neutral-200 px-4 outline-none focus:border-tecnova-red" />
      )}
    </label>
  );
}

function ToggleField({
  field,
  label,
  tooltip,
  value,
  onChange,
}: {
  field: string;
  label: string;
  tooltip: string;
  value: unknown;
  onChange: (field: string, value: unknown) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-4 rounded-lg border border-neutral-200 px-4 py-3 text-sm font-bold">
      <FieldLabel label={label} tooltip={tooltip} />
      <input type="checkbox" checked={Boolean(value)} onChange={(event) => onChange(field, event.target.checked)} />
    </label>
  );
}

function UploadField({
  field,
  label,
  tooltip,
  value,
  preview,
  uploading,
  onUpload,
}: {
  field: string;
  label: string;
  tooltip: string;
  value: unknown;
  preview?: string;
  uploading: boolean;
  onUpload: (event: ChangeEvent<HTMLInputElement>, field: string) => void;
}) {
  const inputId = `upload-${field}`;
  const image = preview || firstImageUrl(value);

  return (
    <div className="block text-sm font-bold">
      <FieldLabel label={label} tooltip={tooltip} />
      {image ? (
        <div className="mt-2 overflow-hidden rounded-lg border border-neutral-200 bg-neutral-50">
          {/* eslint-disable-next-line @next/next/no-img-element -- Admin previews may use blob: URLs from local file inputs. */}
          <img src={image} alt={label} className="h-40 w-full object-contain" />
        </div>
      ) : (
        <div className="mt-2 grid h-40 place-items-center rounded-lg border border-dashed border-neutral-300 bg-neutral-50 px-4 text-center text-xs font-black uppercase tracking-[0.12em] text-neutral-400">
          Sin imagen cargada
        </div>
      )}
      <div className="mt-2 flex gap-2">
        <input value={String(value ?? "")} onChange={() => null} readOnly className="h-11 min-w-0 flex-1 rounded-lg border border-neutral-200 px-4 text-xs outline-none" />
        <label htmlFor={inputId} className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-lg bg-neutral-100 px-3 text-xs font-black transition hover:bg-neutral-200">
          {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />} Subir
        </label>
        <input id={inputId} type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => onUpload(event, field)} className="sr-only" />
      </div>
    </div>
  );
}

type TechnicalSpecRow = {
  clave: string;
  valor: string;
};

function TechnicalSpecsEditor({
  value,
  onChange,
}: {
  value: unknown;
  onChange: (field: string, value: unknown) => void;
}) {
  const rows = parseSpecRows(value);

  function update(nextRows: TechnicalSpecRow[]) {
    onChange("especificaciones", JSON.stringify(nextRows));
  }

  function updateRow(index: number, key: keyof TechnicalSpecRow, nextValue: string) {
    const next = rows.map((row, rowIndex) => (rowIndex === index ? { ...row, [key]: nextValue } : row));
    update(next);
  }

  function addRow() {
    update([...rows, { clave: "", valor: "" }]);
  }

  function applyTemplate(templateName: string) {
    const fields = technicalTemplates[templateName] || [];
    if (fields.length === 0) return;
    const existing = new Set(rows.map((row) => normalizeKey(row.clave)));
    const additions = fields
      .filter((field) => !existing.has(normalizeKey(field)))
      .map((field) => ({ clave: field, valor: "" }));
    if (additions.length > 0) update([...rows, ...additions]);
  }

  return (
    <section className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <FieldLabel label="Ficha técnica" tooltip="Datos técnicos del producto. Se guardan como ficha ordenada, sin escribir JSON." />
          <p className="mt-1 text-xs font-semibold text-neutral-500">Nombre del dato y valor visible en la ficha pública.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <select
            defaultValue=""
            onChange={(event) => {
              applyTemplate(event.target.value);
              event.target.value = "";
            }}
            className="h-10 rounded-lg border border-neutral-200 bg-white px-3 text-xs font-black outline-none focus:border-tecnova-red"
            aria-label="Usar plantilla de ficha técnica"
          >
            <option value="">Usar plantilla</option>
            {Object.keys(technicalTemplates).map((template) => (
              <option key={template} value={template}>{template}</option>
            ))}
          </select>
          <button type="button" onClick={addRow} className="inline-flex h-10 items-center gap-2 rounded-lg bg-tecnova-red px-3 text-xs font-black text-white transition hover:bg-red-700">
            <Plus size={14} /> Agregar dato técnico
          </button>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        {rows.length === 0 && (
          <div className="rounded-lg border border-dashed border-neutral-300 bg-white p-4 text-center text-xs font-black uppercase tracking-[0.12em] text-neutral-400">
            Sin datos técnicos
          </div>
        )}
        {rows.map((row, index) => (
          <div key={index} className="grid gap-2 rounded-lg bg-white p-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)_auto]">
            <input
              value={row.clave}
              onChange={(event) => updateRow(index, "clave", event.target.value)}
              placeholder="Voltaje"
              className="h-11 min-w-0 rounded-lg border border-neutral-200 px-3 text-sm font-semibold outline-none focus:border-tecnova-red"
            />
            <input
              value={row.valor}
              onChange={(event) => updateRow(index, "valor", event.target.value)}
              placeholder="220V"
              className="h-11 min-w-0 rounded-lg border border-neutral-200 px-3 text-sm font-semibold outline-none focus:border-tecnova-red"
            />
            <button type="button" onClick={() => update(rows.filter((_, rowIndex) => rowIndex !== index))} className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-red-50 px-3 text-xs font-black text-tecnova-red">
              <Trash2 size={14} /> Eliminar
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

function StringListEditor({
  field,
  label,
  tooltip,
  value,
  onChange,
  placeholder,
}: {
  field: string;
  label: string;
  tooltip: string;
  value: unknown;
  onChange: (field: string, value: unknown) => void;
  placeholder: string;
}) {
  const rows = parseStringRows(value);

  function update(nextRows: string[]) {
    onChange(field, JSON.stringify(nextRows));
  }

  return (
    <section className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <FieldLabel label={label} tooltip={tooltip} />
        <button type="button" onClick={() => update([...rows, ""])} className="inline-flex h-10 items-center gap-2 rounded-lg bg-neutral-900 px-3 text-xs font-black text-white transition hover:bg-black">
          <Plus size={14} /> Agregar
        </button>
      </div>
      <div className="mt-4 space-y-2">
        {rows.length === 0 && (
          <div className="rounded-lg border border-dashed border-neutral-300 bg-white p-4 text-center text-xs font-black uppercase tracking-[0.12em] text-neutral-400">
            Sin datos cargados
          </div>
        )}
        {rows.map((row, index) => (
          <div key={index} className="grid gap-2 rounded-lg bg-white p-2 sm:grid-cols-[minmax(0,1fr)_auto]">
            <input
              value={row}
              onChange={(event) => update(rows.map((item, rowIndex) => (rowIndex === index ? event.target.value : item)))}
              placeholder={placeholder}
              className="h-11 min-w-0 rounded-lg border border-neutral-200 px-3 text-sm font-semibold outline-none focus:border-tecnova-red"
            />
            <button type="button" onClick={() => update(rows.filter((_, rowIndex) => rowIndex !== index))} className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-red-50 px-3 text-xs font-black text-tecnova-red">
              <Trash2 size={14} /> Eliminar
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

function GalleryField({
  field,
  label,
  tooltip,
  value,
  uploading,
  onUpload,
  onChange,
}: {
  field: string;
  label: string;
  tooltip: string;
  value: unknown;
  uploading: boolean;
  onUpload: (event: ChangeEvent<HTMLInputElement>, field: string) => void;
  onChange: (field: string, value: unknown) => void;
}) {
  const inputId = `upload-${field}`;
  const images = parseJsonArray<string>(value).filter(Boolean);

  function update(nextImages: string[]) {
    onChange(field, JSON.stringify(nextImages));
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= images.length) return;
    const next = [...images];
    [next[index], next[target]] = [next[target], next[index]];
    update(next);
  }

  return (
    <div className="block text-sm font-bold">
      <FieldLabel label={label} tooltip={tooltip} />
      <div className="mt-2 grid gap-3">
        {images.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {images.map((image, index) => (
              <div key={`${image}-${index}`} className="overflow-hidden rounded-lg border border-neutral-200 bg-neutral-50">
                {/* eslint-disable-next-line @next/next/no-img-element -- Admin previews use uploaded public URLs. */}
                <img src={image} alt={`${label} ${index + 1}`} className="h-28 w-full object-cover" />
                <div className="grid grid-cols-3 gap-1 p-2">
                  <button type="button" onClick={() => move(index, -1)} disabled={index === 0} className="rounded bg-white px-2 py-1 text-xs font-black disabled:opacity-40">Arriba</button>
                  <button type="button" onClick={() => move(index, 1)} disabled={index === images.length - 1} className="rounded bg-white px-2 py-1 text-xs font-black disabled:opacity-40">Abajo</button>
                  <button type="button" onClick={() => update(images.filter((_, itemIndex) => itemIndex !== index))} className="rounded bg-red-50 px-2 py-1 text-xs font-black text-tecnova-red">Quitar</button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid h-28 place-items-center rounded-lg border border-dashed border-neutral-300 bg-neutral-50 px-4 text-center text-xs font-black uppercase tracking-[0.12em] text-neutral-400">
            Sin imagenes cargadas
          </div>
        )}
        <label htmlFor={inputId} className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-lg bg-neutral-100 px-3 text-xs font-black transition hover:bg-neutral-200">
          {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />} Subir imagenes
        </label>
        <input id={inputId} type="file" multiple accept="image/jpeg,image/png,image/webp" onChange={(event) => onUpload(event, field)} className="sr-only" />
      </div>
    </div>
  );
}

function FieldLabel({ label, tooltip }: { label: string; tooltip: string }) {
  const [open, setOpen] = useState(false);
  return (
    <span className="relative inline-flex items-center gap-1.5">
      {label}
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        onBlur={() => setOpen(false)}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        title={tooltip}
        aria-label={tooltip}
        className="inline-flex"
      >
        <CircleHelp size={14} className="text-neutral-400" />
      </button>
      {open && (
        <span className="absolute left-0 top-6 z-40 w-64 rounded-lg bg-neutral-950 p-3 text-xs font-bold leading-5 text-white shadow-lift">
          {tooltip}
        </span>
      )}
    </span>
  );
}

function StatusBadge({ item }: { item: Record<string, unknown> }) {
  const value = item.estado ? String(item.estado) : item.activo === false ? "inactivo" : item.disponible === false ? "consulta" : "activo";
  const active = ["activo", "nuevo", "disponible"].includes(value.toLowerCase()) || item.activo === true;
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-black ${active ? "bg-emerald-50 text-emerald-700" : "bg-neutral-100 text-neutral-600"}`}>
      {value}
    </span>
  );
}

async function safeJson(response: Response) {
  return response.json().catch(() => ({ ok: false, message: "Respuesta inválida del servidor." }));
}

function newTemplate(resource: ResourceKey) {
  return { ...templates[resource] };
}

function normalizeSelected(resource: ResourceKey, item: Record<string, unknown>) {
  const base = { ...newTemplate(resource), ...item };
  if (resource === "usuarios") {
    return { ...base, password: "", rol: String(base.rol || "ADMIN").toUpperCase() };
  }
  if (resource === "productos" || resource === "repuestos") {
    return { ...base, moneda: getCurrency(base) };
  }
  return base;
}

function changeProductField(current: Record<string, unknown>, field: string, value: unknown) {
  if (field !== "nombre") return { ...current, [field]: value };

  const previousName = String(current.nombre || "");
  const previousAutoSlug = slugifyText(previousName);
  const currentSlug = String(current.slug || "");
  const shouldUpdateSlug = !current.id || !currentSlug || currentSlug === previousAutoSlug;
  return {
    ...current,
    nombre: value,
    ...(shouldUpdateSlug ? { slug: slugifyText(String(value || "")) } : {}),
  };
}

function preparePayload(resource: ResourceKey, selected: Record<string, unknown>) {
  if (resource === "configuracion") {
    const keys = configGroups.flatMap((group) => group.fields.map((field) => field.key));
    return Object.fromEntries(keys.map((key) => [key, String(selected[key] || "")]));
  }

  if (resource === "productos" || resource === "repuestos") {
    const hasPrice = String(selected.precio ?? "").trim() !== "";
    const image = String(selected.imagenPrincipal || "");
    return {
      ...selected,
      tipo: resource === "repuestos" ? "repuesto" : "producto",
      slug: String(selected.slug || slugifyText(String(selected.nombre || ""))),
      mostrarPrecio: hasPrice,
      etiquetaPrecio: hasPrice ? getCurrency(selected) : "Consultar precio",
      imagenes: normalizeImageList(selected.imagenes, image),
      tags: normalizeStringArray(selected.tags),
      caracteristicas: normalizeStringArray(selected.caracteristicas),
      aplicaciones: normalizeStringArray(selected.aplicaciones),
      compatibilidad: normalizeStringArray(selected.compatibilidad),
      especificaciones: normalizeSpecArray(selected.especificaciones),
    };
  }

  return selected;
}

function settingsRowsToForm(rows: Record<string, unknown>[]) {
  return rows.reduce<Record<string, unknown>>((acc, row) => {
    const key = String(row.clave || "");
    if (key) acc[key] = row.valor || "";
    return acc;
  }, {});
}

function updateImageField(current: Record<string, unknown>, field: string, urls: string[] | string) {
  const nextUrls = Array.isArray(urls) ? urls : [urls];
  if (field === "imagenes") {
    const existing = parseJsonArray<string>(current.imagenes).filter(Boolean);
    return { ...current, imagenes: JSON.stringify([...existing, ...nextUrls].filter(Boolean)) };
  }
  return { ...current, [field]: nextUrls[0] || "" };
}

function getCurrency(value: Record<string, unknown>) {
  const currency = String(value.moneda || value.etiquetaPrecio || "PEN").toUpperCase();
  return currency === "USD" ? "USD" : "PEN";
}

function firstImageUrl(value: unknown) {
  const text = String(value || "");
  if (!text) return "";
  if (text.startsWith("/uploads/") || text.startsWith("/") || text.startsWith("http") || text.startsWith("blob:")) return text;
  const parsed = parseJsonArray<string>(text);
  return parsed[0] || "";
}

function normalizeImageList(value: unknown, mainImage: string) {
  const images = parseJsonArray<string>(value);
  if (mainImage && !images.includes(mainImage)) images.unshift(mainImage);
  return JSON.stringify(images.filter(Boolean));
}

function normalizeStringArray(value: unknown) {
  if (!value) return "[]";
  if (typeof value !== "string") return JSON.stringify(value);
  const trimmed = value.trim();
  if (!trimmed) return "[]";
  const parsed = parseJsonArray<unknown>(trimmed);
  if (parsed.length > 0) return JSON.stringify(parsed.map((item) => String(item || "").trim()).filter(Boolean));
  return JSON.stringify(trimmed.split(/[\n,]+/).map((item) => item.trim()).filter(Boolean));
}

function normalizeSpecArray(value: unknown) {
  if (!value) return "[]";
  if (typeof value !== "string") return JSON.stringify(value);
  const trimmed = value.trim();
  if (!trimmed) return "[]";
  const parsed = parseSpecRows(trimmed);
  if (parsed.length > 0) return JSON.stringify(parsed.filter((item) => item.clave.trim() && item.valor.trim()));
  return JSON.stringify(
    trimmed
      .split(/\n+/)
      .map((line) => {
        const [clave, ...rest] = line.split(":");
        return { clave: clave.trim(), valor: rest.join(":").trim() };
      })
      .filter((item) => item.clave && item.valor)
  );
}

function parseSpecRows(value: unknown): TechnicalSpecRow[] {
  const parsed = parseJsonArray<Partial<TechnicalSpecRow>>(value);
  if (parsed.length > 0) {
    return parsed.map((item) => ({
      clave: String(item?.clave || ""),
      valor: String(item?.valor || ""),
    }));
  }

  const text = String(value || "").trim();
  if (!text) return [];
  return text
    .split(/\n+/)
    .map((line) => {
      const [clave, ...rest] = line.split(":");
      return { clave: clave.trim(), valor: rest.join(":").trim() };
    })
    .filter((item) => item.clave || item.valor);
}

function parseStringRows(value: unknown) {
  const parsed = parseJsonArray<unknown>(value);
  if (parsed.length > 0) return parsed.map((item) => String(item || ""));

  const text = String(value || "").trim();
  if (!text) return [];
  return text.split(/[\n,]+/).map((item) => item.trim()).filter(Boolean);
}

function normalizeKey(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function parseJsonArray<T = unknown>(value?: unknown): T[] {
  if (!value || typeof value !== "string") return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function isLongField(field: string) {
  return [
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
}

function isUploadField(field: string) {
  const lower = field.toLowerCase();
  return lower.includes("imagen") || lower.includes("logo") || lower.includes("favicon");
}

function isNumericField(field: string) {
  return ["orden", "ordenDestacado", "ordenRepuesto", "rating", "monto", "overlayOpacity", "precio", "precioAnterior"].includes(field);
}

function isRequestResource(resource: ResourceKey) {
  return (requestResources as readonly string[]).includes(resource);
}

function label(field: string) {
  const custom: Record<string, string> = {
    categoryId: "Categoría",
    codigoRef: "Código ref.",
    descripcionCorta: "Descripción corta",
    descripcionLarga: "Descripción larga",
    imagenPrincipal: "Imagen principal",
    imagenDesktop: "Imagen desktop",
    imagenMobile: "Imagen mobile",
    seoTitulo: "SEO título",
    seoDesc: "SEO descripción",
    productoServicio: "Producto o servicio",
  };
  return custom[field] || field.replace(/([A-Z])/g, " $1").replace(/^./, (letter) => letter.toUpperCase());
}

function tooltip(field: string) {
  const custom: Record<string, string> = {
    slug: "Parte final de la URL. Se genera automáticamente cuando está vacío.",
    activo: "Controla si el registro aparece o queda disponible.",
    orden: "Número para ordenar elementos en la web.",
    imagenes: "Galería de imágenes. Puedes subir una imagen y luego guardar.",
    logo: "Logo de la marca en formato JPG, PNG o WebP.",
    estado: "Estado interno para seguimiento del equipo administrativo.",
  };
  return custom[field] || "Campo editable del registro.";
}

function recordTitle(item: Record<string, unknown>) {
  return String(item.nombre || item.titulo || item.pregunta || item.email || item.clave || item.documento || item.id);
}

function formatDate(value: unknown) {
  if (!value) return "-";
  return new Date(String(value)).toLocaleDateString("es-PE");
}

function slugifyText(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
