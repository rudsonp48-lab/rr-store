'use client';

import React, { useEffect } from 'react';
import Script from 'next/script';
import { usePathname, useSearchParams } from 'next/navigation';
import { META_PIXEL_ID } from '../lib/metaPixel';

export default function MetaPixelScript() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Permite obter o Pixel ID da variável de ambiente ou de localStorage se o lojista configurar
  const pixelId =
    META_PIXEL_ID ||
    (typeof window !== 'undefined'
      ? localStorage.getItem('rr_store_meta_pixel_id') || ''
      : '');

  // Rastreia PageViews em mudanças de rota no Next.js
  useEffect(() => {
    if (typeof window !== 'undefined' && typeof window.fbq === 'function' && pixelId) {
      window.fbq('track', 'PageView');
    }
  }, [pathname, searchParams, pixelId]);

  if (!pixelId) {
    // Se o Pixel ID ainda não foi configurado, não quebra a página
    return null;
  }

  return (
    <>
      <Script
        id="meta-pixel-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${pixelId}');
            fbq('track', 'PageView');
          `,
        }}
      />
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: 'none' }}
          src={`https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
    </>
  );
}
