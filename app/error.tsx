"use client";

import { useEffect } from "react";

export default function ErrorPage({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="grid min-h-screen place-items-center bg-neutral-100 px-4 text-neutral-950">
      <section className="max-w-md rounded-lg bg-white p-7 text-center shadow-soft ring-1 ring-black/5">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-tecnova-red">Tecnova Perú</p>
        <h1 className="mt-3 text-3xl font-black">No se pudo cargar esta vista</h1>
        <p className="mt-3 text-sm font-semibold leading-6 text-tecnova-steel">
          Intenta nuevamente. Si el problema continúa, revisa la conexión con la base de datos o el panel administrativo.
        </p>
        <button onClick={unstable_retry} className="mt-5 rounded-lg bg-tecnova-red px-5 py-3 text-sm font-black text-white">
          Reintentar
        </button>
      </section>
    </main>
  );
}
