import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'RR Store Brasília | Loja Multidepartamentos • Entrega Expressa no Mesmo Dia no DF',
  description:
    'Tudo o que seu dia a dia em Brasília precisa, na velocidade de um clique. 10 departamentos, 5% OFF no PIX ou até 12x no Cartão e entrega via Motoboy no mesmo dia em todo o DF.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body
        className="bg-[#0A0A0A] text-white antialiased min-h-screen selection:bg-[#10B981] selection:text-[#0A0A0A]"
        style={{
          fontFamily:
            '"Plus Jakarta Sans", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        }}
      >
        {children}
      </body>
    </html>
  );
}
