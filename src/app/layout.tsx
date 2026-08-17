import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/context/ThemeContext';
import FacebookPixel from '@/components/FacebookPixel';
// ⬇️ [NOVO] Importe o componente do Pixel

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ADM-Primeira Mão',
  description: 'Painel Interações e Anúncios',
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>✋</text></svg>",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${inter.className} bg-gray-100 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-200 min-h-screen`}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
        {/* ⬇️ [NOVO] Pixel adicionado aqui - funciona sem atrapalhar o layout */}
        <FacebookPixel />
      </body>
    </html>
  );
}