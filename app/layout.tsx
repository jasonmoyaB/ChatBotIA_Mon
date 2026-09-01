import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";

import "./global.css";

export const metadata: Metadata = {
  title: "Asistente de cuidado",
  description: "Solo lo que sus medicos autorizaron",
  manifest: "/manifest.json",
  icons: { icon: "/icono-192.png", apple: "/icono-180.png" },
  // La URL no debe acabar en un buscador: dentro hay medicacion y sintomas.
  robots: { index: false, follow: false },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Asistente de cuidado",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Sin `maximum-scale`: bloquear el zoom en una app que usa una persona mayor
  // es un fallo de accesibilidad, no una decision de diseño.
  themeColor: "#285d45",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={GeistSans.className}>{children}</body>
    </html>
  );
}
