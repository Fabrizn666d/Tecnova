import { repairText } from "@/lib/text";
import { Mail, MapPin, MessageCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function SiteFooter({
  settings,
}: {
  settings: Record<string, string>;
}) {
  const footerLogo = settings.logo_footer || "/logo.png";
  const copyright = repairText(settings.copyright_texto || "© 2026 Tecnova Perú. Todos los derechos reservados.");
  const designer = repairText(settings.designer_texto || "Designed and developed by Fabrizio Apaza");
  const legalLinks = [
    ["Libro de Reclamaciones", "/libro-de-reclamaciones"],
    ["Política de Privacidad", "/politica-privacidad"],
    ["Política de Cookies", "/politica-cookies"],
    ["Términos y Condiciones", "/terminos-y-condiciones"],
    ["Aviso Legal", "/aviso-legal"],
    ["Cambios y Devoluciones", "/cambios-y-devoluciones"],
  ] as const;

  return (
    <footer className="bg-neutral-100 px-4 py-12 sm:px-5 lg:px-14">
      <div className="mx-auto max-w-[1540px]">
        <div className="grid gap-10 border-b border-neutral-200 pb-10 lg:grid-cols-[1.15fr_0.8fr_0.8fr_1fr]">
          <div>
            <div className="relative h-16 w-[212px] max-w-full">
              <Image src={footerLogo} alt="Tecnova Perú" fill sizes="212px" className="object-contain object-left" />
            </div>
            <p className="mt-5 max-w-sm text-sm font-semibold leading-7 text-tecnova-steel">
              Maquinaria industrial, repuestos y servicio técnico para panificación, producción alimentaria y automatización.
            </p>
            <div className="mt-6 space-y-3 text-sm font-bold text-tecnova-dark">
              <p className="flex items-center gap-3"><MessageCircle size={18} />{repairText(settings.whatsapp_display)}</p>
              <p className="flex items-center gap-3 break-all"><Mail size={18} />{repairText(settings.email)}</p>
              <p className="flex items-center gap-3"><MapPin size={18} />{repairText(settings.direccion)}</p>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-black uppercase tracking-[0.16em]">Empresa</h3>
            <div className="mt-5 grid gap-3 text-sm font-semibold text-tecnova-steel">
              <Link href="/productos" className="hover:text-tecnova-red">Productos</Link>
              <Link href="/repuestos" className="hover:text-tecnova-red">Repuestos</Link>
              <Link href="/servicios" className="hover:text-tecnova-red">Servicios</Link>
              <Link href="/trabajos-realizados" className="hover:text-tecnova-red">Trabajos realizados</Link>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-black uppercase tracking-[0.16em]">Legal Perú</h3>
            <div className="mt-5 grid gap-3 text-sm font-semibold text-tecnova-steel">
              {legalLinks.map(([label, href]) => (
                <Link key={href} href={href} className="hover:text-tecnova-red">
                  {label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-black uppercase tracking-[0.16em]">Datos legales</h3>
            <div className="mt-5 space-y-3 text-sm font-semibold leading-6 text-tecnova-steel">
              <p>Razón social: {repairText(settings.razon_social || settings.empresa_nombre)}</p>
              <p>RUC: {settings.ruc || "Por actualizar"}</p>
              <p>Dirección: {repairText(settings.direccion)}</p>
            </div>
            <a
              href={`https://wa.me/${settings.whatsapp || "51937492227"}?text=${encodeURIComponent("Hola Tecnova, quiero solicitar información.")}`}
              target="_blank"
              rel="noreferrer"
              className="mt-6 inline-flex rounded-full bg-black px-5 py-3 text-sm font-black text-white transition hover:bg-tecnova-red"
            >
              Cotizar por WhatsApp
            </a>
          </div>
        </div>
        <div className="mt-8 flex flex-col justify-between gap-3 text-sm font-bold text-tecnova-steel lg:flex-row">
          <span>{copyright}</span>
          <span>{designer}</span>
        </div>
      </div>
    </footer>
  );
}
