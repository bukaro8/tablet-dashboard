import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const deploymentHost =
  process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL;
const metadataBase = new URL(
  deploymentHost ? `https://${deploymentHost}` : "http://localhost:3000",
);

export const metadata: Metadata = {
  metadataBase,
  applicationName: "Pantalla Londres",
  title: "Pantalla Londres",
  description: "Reloj ambiental y pronóstico de Londres con hora de Colombia.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Pantalla Londres",
  },
  formatDetection: { telephone: false },
  openGraph: {
    type: "website",
    locale: "es_ES",
    siteName: "Pantalla Londres",
    title: "Pantalla Londres",
    description: "Tiempo de Londres y hora de Colombia en una pantalla ambiental.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pantalla Londres",
    description: "Tiempo de Londres y hora de Colombia en una pantalla ambiental.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#05070a",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${geistSans.variable} h-full antialiased`}>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
