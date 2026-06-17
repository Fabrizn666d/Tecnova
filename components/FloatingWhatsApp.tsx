"use client";

import { MessageCircle } from "lucide-react";
import { usePathname } from "next/navigation";

export default function FloatingWhatsApp({
  whatsapp,
  message,
}: {
  whatsapp?: string;
  message?: string;
}) {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;

  const phone = (whatsapp || "51937492227").replace(/\D/g, "") || "51937492227";
  const text = message || "Hola Tecnova, quiero solicitar información.";

  return (
    <a
      href={`https://wa.me/${phone}?text=${encodeURIComponent(text)}`}
      target="_blank"
      rel="noreferrer"
      aria-label="Contactar por WhatsApp"
      className="fixed bottom-5 right-5 z-[70] grid h-16 w-16 place-items-center rounded-full bg-emerald-600 text-white shadow-[0_18px_40px_rgba(5,150,105,0.35)] ring-4 ring-white/90 transition hover:scale-105 hover:bg-emerald-700 sm:bottom-6 sm:right-6"
    >
      <span className="absolute inset-0 rounded-full bg-emerald-500/35 motion-safe:animate-ping" />
      <MessageCircle className="relative h-7 w-7" />
    </a>
  );
}
