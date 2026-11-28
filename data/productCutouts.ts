import { Product } from '../types/store';

/**
 * Mapeia produtos da Apple para seus PNGs oficiais transparentes de estúdio
 * em alta resolução (100% sem bordas serrilhadas ou halos de compressão).
 */
export function resolveProductCutout(
  product?: { id?: string; nome?: string; imagem?: string } | Product | null
): string {
  if (!product) return '';
  const id = (product.id || '').toLowerCase();
  const name = (product.nome || '').toLowerCase();
  const img = product.imagem || '';

  // Se já for um arquivo cutout estático transparente
  if (img.startsWith('/apple-cutouts/')) {
    return img;
  }

  // 1. iPhone 18 Pro / 18 Pro Max
  if (
    id.includes('ip18p') ||
    id.includes('ip18-pro') ||
    (name.includes('iphone 18') && (name.includes('pro') || name.includes('max') || name.includes('bordo')))
  ) {
    return '/apple-cutouts/ip18pm-bordo.png';
  }

  // 2. iPhone 17 Pro / Pro Max
  if (name.includes('iphone 17') || id.includes('ip17')) {
    if (name.includes('laranja') || id.includes('laranja') || name.includes('orange')) {
      return '/apple-cutouts/ip17pm-laranja.png';
    }
    return '/apple-cutouts/ip17pm-silver.png';
  }

  // 3. Apple Watch
  if (id.includes('watch') || name.includes('watch')) {
    if (id.includes('ultra') || name.includes('ultra')) {
      return '/apple-cutouts/watch-ultra3-black.png';
    }
    return '/apple-cutouts/watch-s12-bordo.png';
  }

  // 4. MacBook
  if (id.includes('macbook') || name.includes('macbook')) {
    if (
      id.includes('neo') ||
      name.includes('neo') ||
      name.includes('citrus') ||
      name.includes('amarelo') ||
      name.includes('rosa')
    ) {
      return '/apple-cutouts/macbook-neo-citrus.png';
    }
    return '/apple-cutouts/macbook-air-m5-midnight.png';
  }

  // 5. iPad
  if (id.includes('ipad') || name.includes('ipad')) {
    return '/apple-cutouts/ipad-pro-m5-13-preto.png';
  }

  // 6. AirPods
  if (id.includes('airpods') || name.includes('airpods')) {
    if (id.includes('max') || name.includes('max')) {
      return '/apple-cutouts/airpods-max2-azul.png';
    }
    return '/apple-cutouts/airpods-pro-3.png';
  }

  return img;
}
