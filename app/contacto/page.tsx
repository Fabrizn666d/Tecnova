import ContactForm from "@/components/ContactForm";
import GoogleMapSection from "@/components/GoogleMapSection";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { getSettingsMap } from "@/lib/settings";
import { Mail, MapPin, MessageCircle } from "lucide-react";
import type { Metadata } from "next";
import { FaFacebookF, FaInstagram, FaTiktok, FaYoutube } from "react-icons/fa";
import type { ComponentType } from "react";

export const metadata: Metadata = {
  title: "Contacto | Tecnova Perú",
  description: "Solicita cotización de maquinaria, repuestos o servicio técnico industrial.",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ContactoPage() {
  const settings = await getSettingsMap();
  return (
    <main className="min-h-screen bg-white text-tecnova-dark">
      <SiteHeader whatsapp={settings.whatsapp} whatsappDisplay={settings.whatsapp_display} logo={settings.logo_principal} />
      <section className="mx-auto grid max-w-[1300px] gap-7 px-4 py-10 sm:px-5 lg:grid-cols-[0.8fr_1.2fr] lg:px-14">
        <div className="rounded-[30px] bg-black p-7 text-white shadow-lift sm:p-10">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-red-200">Contacto</p>
          <h1 className="mt-3 text-4xl font-black leading-none tracking-[-0.055em] sm:text-6xl">Cotiza con soporte técnico</h1>
          <div className="mt-7 space-y-4 text-sm font-bold text-white/82">
            <p className="flex items-center gap-3"><MessageCircle size={18} />{settings.whatsapp_display}</p>
            <p className="flex items-center gap-3 break-all"><Mail size={18} />{settings.email}</p>
            <p className="flex items-center gap-3"><MapPin size={18} />{settings.direccion}</p>
          </div>
        </div>
        <ContactForm whatsapp={settings.whatsapp} />
      </section>
      <section className="mx-auto max-w-[1300px] px-4 pb-4 sm:px-5 lg:px-14">
        <div className="grid gap-4 rounded-[28px] bg-neutral-100 p-5 shadow-soft ring-1 ring-black/5 sm:grid-cols-2 lg:grid-cols-4">
          <ContactItem icon={MessageCircle} label="Teléfono" value={settings.telefono || settings.whatsapp_display} href={settings.whatsapp ? `https://wa.me/${settings.whatsapp}` : undefined} />
          <ContactItem icon={Mail} label="Correo" value={settings.email} href={settings.email ? `mailto:${settings.email}` : undefined} />
          <ContactItem icon={MapPin} label="Dirección" value={settings.direccion} />
          <SocialLinks settings={settings} />
        </div>
      </section>
      <GoogleMapSection settings={settings} />
      <SiteFooter settings={settings} />
    </main>
  );
}

function ContactItem({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: ComponentType<{ size?: number; className?: string }>;
  label: string;
  value?: string;
  href?: string;
}) {
  const content = (
    <>
      <Icon size={20} className="text-tecnova-red" />
      <span>
        <span className="block text-[10px] font-black uppercase tracking-[0.14em] text-neutral-500">{label}</span>
        <span className="mt-1 block break-words text-sm font-black text-neutral-950">{value || "Por actualizar"}</span>
      </span>
    </>
  );
  if (href) {
    return <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer" className="flex items-center gap-3 rounded-2xl bg-white p-4">{content}</a>;
  }
  return <div className="flex items-center gap-3 rounded-2xl bg-white p-4">{content}</div>;
}

function SocialLinks({ settings }: { settings: Record<string, string> }) {
  const links = [
    ["Instagram", settings.instagram_url, FaInstagram],
    ["TikTok", settings.tiktok_url, FaTiktok],
    ["Facebook", settings.facebook_url, FaFacebookF],
    ["YouTube", settings.youtube_url, FaYoutube],
  ] as const;
  const visible = links.filter(([, href]) => href);

  return (
    <div className="rounded-2xl bg-white p-4">
      <p className="text-[10px] font-black uppercase tracking-[0.14em] text-neutral-500">Redes sociales</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {visible.length === 0 && <span className="text-sm font-bold text-tecnova-steel">Por actualizar</span>}
        {visible.map(([label, href, Icon]) => (
          <a key={label} href={href} target="_blank" rel="noreferrer" className="grid h-10 w-10 place-items-center rounded-full bg-neutral-100 text-neutral-900 transition hover:bg-tecnova-red hover:text-white" aria-label={label}>
            <Icon size={18} />
          </a>
        ))}
      </div>
    </div>
  );
}
