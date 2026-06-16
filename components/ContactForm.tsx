"use client";

import { Send } from "lucide-react";
import { FormEvent, useState } from "react";

export default function ContactForm() {
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("");
    setLoading(true);
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/contacto", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(form.entries())),
    });
    setLoading(false);
    if (response.ok) {
      event.currentTarget.reset();
      setStatus("Consulta registrada correctamente.");
    } else {
      const payload = await response.json().catch(() => null);
      setStatus(payload?.message || "No se pudo enviar la consulta.");
    }
  }

  return (
    <form onSubmit={submit} className="rounded-[28px] bg-white p-5 shadow-soft ring-1 ring-black/5 sm:p-7">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field name="nombre" label="Nombre" required />
        <Field name="telefono" label="Teléfono" required />
        <Field name="email" label="Correo" type="email" />
        <label className="block text-sm font-bold sm:col-span-2">
          Consulta
          <textarea name="mensaje" required className="mt-2 min-h-32 w-full rounded-2xl border border-neutral-200 px-4 py-3 outline-none focus:border-tecnova-red" />
        </label>
      </div>
      {status && <p className="mt-4 rounded-2xl bg-neutral-100 p-3 text-sm font-black">{status}</p>}
      <button disabled={loading} className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-tecnova-red text-sm font-black text-white transition hover:bg-red-700 disabled:opacity-60">
        <Send size={17} /> {loading ? "Enviando..." : "Enviar consulta"}
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
      <input name={name} type={type} required={required} className="mt-2 h-12 w-full rounded-2xl border border-neutral-200 px-4 outline-none focus:border-tecnova-red" />
    </label>
  );
}
