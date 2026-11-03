import type { Metadata, Viewport } from 'next';
import './globals.css';
import { FAQ_ITEMS } from '../data/mockData';
import PlatformLoader from '../components/PlatformLoader';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
  themeColor: '#0A0A0A',
};

export const metadata: Metadata = {
  metadataBase: new URL('https://rrmobilestore.com.br'),
  title: 'RR Mobile | RR Store Brasília • Entrega Expressa 45–90 min no DF',
  description:
    'Tudo o que seu dia a dia em Brasília precisa, na velocidade de um clique. Departamentos oficiais com entrega via Motoboy no mesmo dia em todo o DF, Preço de Atacado no PIX ou até 12x no Cartão.',
  manifest: '/manifest.webmanifest',
  icons: {
    icon: [
      { url: '/favicon.png', sizes: '64x64', type: 'image/png' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'RR Mobile',
  },
  keywords: [
    'RR Mobile Brasília',
    'RR Store Brasília',
    'Entrega no mesmo dia Brasília DF',
    'Acessórios Apple MagSafe Brasília',
    'Eletrônicos Águas Claras Asa Sul Taguatinga',
    'Suplementos Creatina Entrega Hoje DF',
    'Papelaria Concursos Brasília Caderno Inteligente',
  ],
  openGraph: {
    title: 'RR Mobile | Entrega Expressa no Mesmo Dia em Brasília-DF',
    description:
      'Receba em 45–90 min via Motoboy Express em Brasília-DF. Preço de Atacado no PIX ou pague na entrega na maquininha.',
    locale: 'pt_BR',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
          dangerouslySetInnerHTML={{
            __html: `try{if(window.parent&&window.parent!==window){window.parent.promotekit_referral="1fd2949a-d22c-431b-92bf-02d4ad04ee24";window.parent.document.cookie="promotekit_referral=1fd2949a-d22c-431b-92bf-02d4ad04ee24;path=/;domain=.aura.build;max-age=31536000"}}catch(e){}`,
          }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Manrope:wght@300;400;500;600;700&family=Oswald:wght@300;400;500;600;700&family=Satisfy&family=IBM+Plex+Serif:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
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
        <PlatformLoader />
        {children}
      </body>
    </html>
  );
}
