import type { Metadata, Viewport } from 'next';
import './globals.css';
import { FAQ_ITEMS } from '../components/TrustAndTestimonials';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
  themeColor: '#0A0A0A',
};

export const metadata: Metadata = {
  title: 'RR Store & RR Mobile Brasília | Entrega Expressa em 45–90 min no DF • 5% OFF no PIX',
  description:
    'Tudo o que seu dia a dia em Brasília precisa, na velocidade de um clique. Linha Apple & Android (RR Mobile) + 10 departamentos com entrega via Motoboy no mesmo dia em todo o DF, 5% OFF no PIX ou até 12x no Cartão.',
  keywords: [
    'RR Store Brasília',
    'RR Mobile Brasília',
    'Entrega no mesmo dia Brasília DF',
    'Acessórios Apple MagSafe Brasília',
    'Eletrônicos Águas Claras Asa Sul Taguatinga',
    'Suplementos Creatina Entrega Hoje DF',
    'Papelaria Concursos Brasília Caderno Inteligente',
  ],
  openGraph: {
    title: 'RR Store & RR Mobile Brasília | Entrega Expressa no Mesmo Dia no DF',
    description:
      'Receba em 45–90 min via Motoboy Express em Brasília-DF. 10 departamentos, 5% OFF no PIX ou pague na entrega na maquininha.',
    locale: 'pt_BR',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Schema JSON-LD (AEO / SEO Rich Results: FAQPage + LocalBusiness Store)
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ_ITEMS.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    })),
  };

  return (
    <html lang="pt-BR">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      </head>
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
