"use client";

import { MessageCircle, Send, X } from "lucide-react";
import { FormEvent, useState } from "react";

export default function ContactForm({ whatsapp }: { whatsapp?: string }) {
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const phone = (whatsapp || "").replace(/\D/g, "");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;
    setStatus("");
    setLoading(true);
    const target = event.currentTarget;
    const form = new FormData(target);

    try {
      const response = await fetch("/api/contacto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(form.entries())),
      });

      if (response.ok) {
        target.reset();
        setSuccessOpen(true);
        return;
      }

      const payload = await response.json().catch(() => null);
      setStatus(payload?.message || "No se pudo enviar la consulta.");
    } catch {
      setStatus("No se pudo enviar la consulta. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
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
        {status && <p className="mt-4 rounded-2xl bg-red-50 p-3 text-sm font-black text-tecnova-red">{status}</p>}
        <button disabled={loading} className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-tecnova-red text-sm font-black text-white transition hover:bg-red-700 disabled:opacity-60">
          <Send size={17} /> {loading ? "Enviando..." : "Enviar consulta"}
        </button>
      </form>

      {successOpen && (
        <div className="fixed inset-0 z-[90] grid place-items-center bg-black/50 px-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-md rounded-[24px] bg-white p-6 shadow-lift">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-tecnova-red">Consulta recibida</p>
                <h2 className="mt-2 text-2xl font-black">Gracias por escribirnos.</h2>
              </div>
              <button type="button" onClick={() => setSuccessOpen(false)} className="grid h-10 w-10 place-items-center rounded-full bg-neutral-100" aria-label="Cerrar">
                <X size={18} />
              </button>
            </div>
            <p className="mt-4 text-sm font-semibold leading-7 text-tecnova-steel">
              Hemos recibido tu consulta correctamente. Nos comunicaremos contigo pronto por WhatsApp o correo.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button type="button" onClick={() => setSuccessOpen(false)} className="inline-flex h-11 items-center rounded-full bg-neutral-100 px-5 text-sm font-black">
                Cerrar
              </button>
              {phone && (
                <a href={`https://wa.me/${phone}`} target="_blank" rel="noreferrer" className="inline-flex h-11 items-center gap-2 rounded-full bg-tecnova-red px-5 text-sm font-black text-white">
                  <MessageCircle size={17} /> Ir a WhatsApp
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </>
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
