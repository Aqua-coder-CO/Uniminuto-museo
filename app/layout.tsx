import type { Metadata } from "next";
import { Newsreader, Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

const newsreader = Newsreader({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-newsreader",
});

export const metadata: Metadata = {
  title: "Inscripción · Museo de Arte Contemporáneo UNIMINUTO",
  description:
    "Regístrate y elige una experiencia artística del Museo de Arte Contemporáneo de UNIMINUTO.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${outfit.variable} ${newsreader.variable} h-full antialiased`}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
