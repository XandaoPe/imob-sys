import type { Metadata } from "next";
import { Inter } from "next/font/google"; // Corrigido para 'next/font/google'
import "./globals.css"; // Injeção obrigatória dos estilos do Tailwind

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Sistema MultiTenant",
  description: "Gerenciador de registros isolados",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>{children}</body>
    </html>
  );
}