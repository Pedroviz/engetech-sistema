import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Engetech Soluções",
  description: "Sistema de Gestão de Obras",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png", // ← ícone para iPhone
  },
  manifest: "/manifest.json", // ← PWA manifest
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
