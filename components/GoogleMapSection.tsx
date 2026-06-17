import { googleMapsEmbedSrc } from "@/lib/maps";
import { repairText } from "@/lib/text";
import { MapPin } from "lucide-react";

export default function GoogleMapSection({ settings }: { settings: Record<string, string> }) {
  const mapSrc = googleMapsEmbedSrc(settings);
  const address = repairText(settings.direccion || "");

  return (
    <section className="mx-auto max-w-[1540px] px-4 py-8 sm:px-5 lg:px-14">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-tecnova-red">Ubicación</p>
          <h2 className="mt-2 text-3xl font-black tracking-[-0.05em] sm:text-5xl">Encuéntranos en Lima</h2>
        </div>
        {address && (
          <p className="hidden max-w-md items-center gap-2 text-right text-sm font-bold text-tecnova-steel sm:flex">
            <MapPin size={18} className="shrink-0 text-tecnova-red" />
            {address}
          </p>
        )}
      </div>
      <div className="overflow-hidden rounded-[28px] bg-neutral-100 shadow-soft ring-1 ring-black/5">
        <iframe
          src={mapSrc}
          title="Ubicación Tecnova Perú"
          className="h-[420px] w-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
      {address && <p className="mt-3 text-sm font-bold text-tecnova-steel sm:hidden">{address}</p>}
    </section>
  );
}

