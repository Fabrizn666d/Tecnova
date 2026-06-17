import { safeImagePath } from "@/lib/catalog";
import { repairText } from "@/lib/text";
import { Mail, MapPin, MessageCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { FaFacebookF, FaInstagram, FaTiktok, FaYoutube } from "react-icons/fa";

export default function SiteFooter({ settings }: { settings: Record<string, string> }) {
  const footerLogo = safeImagePath(settings.logo_footer) || "/logo.png";
  const description = repairText(
    settings.footer_descripcion ||
      "Maquinaria industrial, repuestos y servicio técnico para panificación, producción alimentaria y automatización."
  );
  const copyright = repairText(settings.copyright_texto || "© 2026 Tecnova Perú. Todos los derechos reservados.");
  const designer = repairText(settings.designer_texto || "Designed and developed by Fabrizio Apaza");
  const socialLinks = [
    ["Instagram", settings.instagram_url, FaInstagram],
    ["TikTok", settings.tiktok_url, FaTiktok],
    ["Facebook", settings.facebook_url, FaFacebookF],
    ["YouTube", settings.youtube_url, FaYoutube],
  ] as const;
  const legalLinks = [
    [settings.legal_libro_label || "Libro de Reclamaciones", settings.legal_libro_url || "/libro-de-reclamaciones"],
    [settings.legal_privacidad_label || "Política de Privacidad", settings.legal_privacidad_url || "/politica-privacidad"],
    [settings.legal_cookies_label || "Política de Cookies", settings.legal_cookies_url || "/politica-cookies"],
    [settings.legal_terminos_label || "Términos y Condiciones", settings.legal_terminos_url || "/terminos-y-condiciones"],
    [settings.legal_aviso_label || "Aviso Legal", settings.legal_aviso_url || "/aviso-legal"],
    [settings.legal_cambios_label || "Cambios y Devoluciones", settings.legal_cambios_url || "/cambios-y-devoluciones"],
  ] as const;

  return (
    <footer className="bg-neutral-100 px-4 py-12 sm:px-5 lg:px-14">
      <div className="mx-auto max-w-[1540px]">
        <div className="grid gap-10 border-b border-neutral-200 pb-10 lg:grid-cols-[1.15fr_0.8fr_0.8fr_1fr]">
          <div>
            <div className="relative h-16 w-[212px] max-w-full">
              <Image src={footerLogo} alt="Tecnova Perú" fill sizes="212px" className="object-contain object-left" />
            </div>
            <p className="mt-5 max-w-sm text-sm font-semibold leading-7 text-tecnova-steel">{description}</p>
            <div className="mt-6 space-y-3 text-sm font-bold text-tecnova-dark">
              <p className="flex items-center gap-3"><MessageCircle size={18} />{repairText(settings.whatsapp_display)}</p>
              <p className="flex items-center gap-3 break-all"><Mail size={18} />{repairText(settings.email)}</p>
              <p className="flex items-center gap-3"><MapPin size={18} />{repairText(settings.direccion)}</p>
            </div>
            {socialLinks.some(([, href]) => href) && (
              <div className="mt-6">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-neutral-500">Síguenos</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {socialLinks.filter(([, href]) => href).map(([label, href, Icon]) => (
                    <a key={label} href={href} target="_blank" rel="noreferrer" aria-label={label} className="grid h-10 w-10 place-items-center rounded-full bg-white text-neutral-900 transition hover:bg-tecnova-red hover:text-white">
                      <Icon size={18} />
                    </a>
                  ))}
                </div>
              </div>
            )}
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
                  {repairText(label)}
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
              href={`https://wa.me/${settings.whatsapp || "51937492227"}?text=${encodeURIComponent(settings.mensaje_whatsapp || "Hola Tecnova, quiero solicitar información.")}`}
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
