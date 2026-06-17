import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";
import { getSettingsMap } from "@/lib/settings";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://tecnovaperu.com"),
  title: {
    default: "Tecnova Perú | Maquinaria industrial",
    template: "%s",
  },
  description:
    "Venta, instalación, reparación y mantenimiento de maquinaria industrial, repuestos y servicios técnicos para panificación y producción.",
  openGraph: {
    title: "Tecnova Perú | Maquinaria industrial",
    description:
      "Maquinaria industrial, repuestos, instalación, reparación y mantenimiento para panificación y producción.",
    siteName: "Tecnova Perú",
    locale: "es_PE",
    type: "website",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const settings = await getSettingsMap();
  return (
    <html lang="es">
      <body className={`${inter.variable} ${spaceGrotesk.variable}`}>
        {children}
        <FloatingWhatsApp whatsapp={settings.whatsapp} message={settings.mensaje_whatsapp} />
      </body>
    </html>
  );
}
