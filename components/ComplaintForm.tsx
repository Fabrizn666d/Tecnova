"use client";

import { Send } from "lucide-react";
import { FormEvent, useState } from "react";

export default function ComplaintForm() {
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("");
    setLoading(true);
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/libro-de-reclamaciones", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(form.entries())),
    });
    setLoading(false);
    if (response.ok) {
      event.currentTarget.reset();
      setStatus("Registro guardado correctamente.");
    } else {
      const payload = await response.json().catch(() => null);
      setStatus(payload?.message || "No se pudo guardar el registro.");
    }
  }

  return (
    <form onSubmit={submit} className="rounded-lg bg-white p-5 shadow-soft ring-1 ring-black/5 sm:p-7">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field name="nombre" label="Nombres y apellidos o razón social" required />
        <Field name="documento" label="Documento DNI/CE/RUC" required />
        <Field name="telefono" label="Teléfono" />
        <Field name="email" label="Correo" type="email" />
        <label className="block text-sm font-bold">
          Dirección
          <input name="direccion" className="mt-2 h-12 w-full rounded-lg border border-neutral-200 px-4 outline-none focus:border-tecnova-red" />
        </label>
        <label className="block text-sm font-bold">
          Tipo de solicitud
          <select name="tipo" className="mt-2 h-12 w-full rounded-lg border border-neutral-200 bg-white px-4 outline-none focus:border-tecnova-red">
            <option value="reclamo">Reclamo</option>
            <option value="queja">Queja</option>
          </select>
        </label>
        <Field name="productoServicio" label="Producto o servicio" />
        <Field name="monto" label="Monto reclamado o referencial" type="number" />
        <label className="block text-sm font-bold sm:col-span-2">
          Detalle del reclamo o queja
          <textarea name="detalle" required className="mt-2 min-h-32 w-full rounded-lg border border-neutral-200 px-4 py-3 outline-none focus:border-tecnova-red" />
        </label>
        <label className="block text-sm font-bold sm:col-span-2">
          Pedido del consumidor
          <textarea name="pedido" required className="mt-2 min-h-28 w-full rounded-lg border border-neutral-200 px-4 py-3 outline-none focus:border-tecnova-red" />
        </label>
        <label className="flex items-start gap-3 rounded-lg border border-neutral-200 p-4 text-sm font-bold sm:col-span-2">
          <input name="aceptacion" value="true" type="checkbox" required className="mt-1" />
          <span>Acepto que Tecnova Perú registre y use estos datos para atender mi solicitud y comunicarse conmigo.</span>
        </label>
      </div>
      {status && <p className="mt-4 rounded-lg bg-neutral-100 p-3 text-sm font-black">{status}</p>}
      <button disabled={loading} className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-tecnova-red text-sm font-black text-white transition hover:bg-red-700 disabled:opacity-60">
        <Send size={17} /> {loading ? "Guardando..." : "Registrar reclamación"}
      </button>
    </form>
  );
}

function Field({
  name,
  label,
  type = "text",
  required = false,
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block text-sm font-bold">
      {label}
      <input name={name} type={type} required={required} className="mt-2 h-12 w-full rounded-lg border border-neutral-200 px-4 outline-none focus:border-tecnova-red" />
    </label>
  );
}
