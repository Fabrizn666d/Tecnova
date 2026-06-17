"use client";

import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function AdminLoginPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [email, setEmail] = useState("admin@tecnovaperu.com");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const response = await fetch("/api/admin/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const payload = await response.json();
    setLoading(false);
    if (!response.ok) {
      setError(payload.message || "No se pudo iniciar sesión.");
      return;
    }
    router.push(pathname.startsWith("/panel-tecnova") ? "/panel-tecnova" : "/admin");
  }

  return (
    <main className="grid min-h-screen place-items-center bg-neutral-100 px-4 py-10 text-neutral-950">
      <form onSubmit={submit} className="w-full max-w-md rounded-[28px] bg-white p-7 shadow-soft ring-1 ring-black/5">
        <div className="relative mb-8 h-14 w-48">
          <Image src="/logo.png" alt="Tecnova Perú" fill sizes="192px" className="object-contain object-left" />
        </div>
        <p className="text-xs font-black uppercase tracking-[0.18em] text-tecnova-red">
          Tecnova Perú · Área administrativa
        </p>
        <h1 className="mt-3 text-4xl font-black tracking-[-0.05em]">Ingreso seguro</h1>
        <div className="mt-8 space-y-4">
          <label className="block text-sm font-bold">
            Email
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-2 h-12 w-full rounded-2xl border border-neutral-200 px-4 outline-none transition focus:border-tecnova-red"
              type="email"
              required
            />
          </label>
          <label className="block text-sm font-bold">
            Contraseña
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-2 h-12 w-full rounded-2xl border border-neutral-200 px-4 outline-none transition focus:border-tecnova-red"
              type="password"
              required
            />
          </label>
        </div>
        {error && <p className="mt-4 rounded-2xl bg-red-50 p-3 text-sm font-bold text-tecnova-red">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="mt-6 h-12 w-full rounded-2xl bg-tecnova-red text-sm font-black text-white transition hover:bg-red-700 disabled:opacity-60"
        >
          {loading ? "Validando..." : "Entrar al panel"}
        </button>
      </form>
    </main>
  );
}
