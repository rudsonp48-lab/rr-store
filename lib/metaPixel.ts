import { CartItem, Product } from '../types/store';

// Pixel ID configurável via Variável de Ambiente (ex: Vercel) ou valor padrão
export const META_PIXEL_ID =
  process.env.NEXT_PUBLIC_META_PIXEL_ID || '';

declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
    _fbq?: any;
  }
}

/**
 * Dispara evento seguro no Meta Pixel (só executa no navegador se o Pixel existir).
 */
export function trackMetaEvent(eventName: string, params?: Record<string, any>) {
  if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
    try {
      if (params) {
        window.fbq('track', eventName, params);
      } else {
        window.fbq('track', eventName);
      }
    } catch {
      // Ignora silenciosamente em navegadores com adblockers
    }
  }
}

/**
 * Dispara evento personalizado (Custom Event).
 */
export function trackMetaCustomEvent(eventName: string, params?: Record<string, any>) {
  if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
    try {
      window.fbq('trackCustom', eventName, params);
    } catch {
      // Ignora silenciosamente
    }
  }
}

/**
 * Disparado ao visualizar detalhes de um produto específico (ViewContent)
 */
export function trackViewContent(product: Product) {
  trackMetaEvent('ViewContent', {
    content_name: product.nome,
    content_category: product.categoria,
    content_ids: [product.id],
    content_type: 'product',
    value: product.precoPix,
    currency: 'BRL',
  });
}

/**
 * Disparado ao adicionar produto ao carrinho (AddToCart)
 */
export function trackAddToCart(product: Product, quantity = 1) {
  trackMetaEvent('AddToCart', {
    content_name: product.nome,
    content_category: product.categoria,
    content_ids: [product.id],
    content_type: 'product',
    value: product.precoPix * quantity,
    currency: 'BRL',
    num_items: quantity,
  });
}

/**
 * Disparado ao abrir o carrinho ou iniciar o fluxo de checkout (InitiateCheckout)
 */
export function trackInitiateCheckout(items: CartItem[], totalPix: number) {
  trackMetaEvent('InitiateCheckout', {
    content_ids: items.map((i) => i.product.id),
    content_type: 'product',
    value: totalPix,
    currency: 'BRL',
    num_items: items.reduce((acc, i) => acc + i.quantity, 0),
  });
}

/**
 * Disparado quando o cliente clica para falar no WhatsApp ou envia pedido (Contact / Lead)
 * Este é o principal evento de conversão para o tráfego pago no DF!
 */
export function trackContact(source: string, value?: number, details?: Record<string, any>) {
  trackMetaEvent('Contact', {
    source,
    value: value || 0,
    currency: 'BRL',
    ...details,
  });
  // Dispara também Lead para campanhas otimizadas por geração de leads
  trackMetaEvent('Lead', {
    content_name: source,
    value: value || 0,
    currency: 'BRL',
  });
}

/**
 * Disparado na simulação de Trade-In (Seu Usado como Entrada)
 */
export function trackTradeInSimulation(
  modelOrData:
    | string
    | {
        usedModel: string;
        usedStorage?: string;
        condition: string;
        evaluatedValue: number;
        targetProductId?: string;
        targetProductName?: string;
        differencePix?: number;
      },
  condition?: string,
  estimatedValue?: number
) {
  if (typeof modelOrData === 'object') {
    trackMetaCustomEvent('SimulateTradeIn', {
      used_model: `${modelOrData.usedModel} ${modelOrData.usedStorage || ''}`.trim(),
      used_condition: modelOrData.condition,
      estimated_trade_value: modelOrData.evaluatedValue,
      target_product_id: modelOrData.targetProductId,
      target_product_name: modelOrData.targetProductName,
      difference_pix: modelOrData.differencePix,
      currency: 'BRL',
    });
  } else {
    trackMetaCustomEvent('SimulateTradeIn', {
      used_model: modelOrData,
      used_condition: condition,
      estimated_trade_value: estimatedValue,
      currency: 'BRL',
    });
  }
}
