import { repairText } from "@/lib/text";

type FaqItem = {
  id: string;
  pregunta: string;
  respuesta: string;
};

export default function FaqSection({ items }: { items: FaqItem[] }) {
  if (items.length === 0) return null;

  return (
    <section className="mx-auto max-w-[1540px] px-4 py-8 sm:px-5 lg:px-14">
      <div className="mb-6">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-tecnova-red">Preguntas frecuentes</p>
        <h2 className="mt-2 text-3xl font-black tracking-[-0.05em] sm:text-5xl">Respuestas rápidas</h2>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {items.map((item) => (
          <details key={item.id} className="group rounded-lg bg-white p-5 shadow-soft ring-1 ring-black/5">
            <summary className="cursor-pointer list-none text-lg font-black marker:hidden">
              {repairText(item.pregunta)}
            </summary>
            <p className="mt-4 border-t border-neutral-100 pt-4 text-sm font-semibold leading-7 text-tecnova-steel">
              {repairText(item.respuesta)}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}
