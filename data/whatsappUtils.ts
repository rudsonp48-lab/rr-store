import { CartItem, CustomerCheckoutData, DFRegion, Product } from '../types/store';
import { formatBRL, WHATSAPP_NUMBER } from './mockData';

export function generateOrderCode(): string {
  const randomDigits = Math.floor(1000 + Math.random() * 9000);
  return `#RR-${randomDigits}`;
}

export function generateSimulatedPixPayload(orderCode: string, totalValue: number): string {
  const cleanOrder = orderCode.replace(/[^a-zA-Z0-9]/g, '');
  const amountFormatted = totalValue.toFixed(2);
  return `00020126580014BR.GOV.BCB.PIX0136rrstore.pagamentos@brasilia.df.gov520400005303986540${amountFormatted.length}${amountFormatted}5802BR5919RR STORE BRASILIA DF6008BRASILIA62160512${cleanOrder}6304A9F2`;
}

export function buildSingleProductWhatsAppUrl(product: Product, regiaoNome: string): string {
  const orderCode = generateOrderCode();
  const message = [
    `Olá, equipe *RR Store Brasília*! 👋`,
    `Quero fazer a compra rápida deste produto (${orderCode}):`,
    ``,
    `🛍️ *Produto:* ${product.nome}`,
    `📂 *Departamento:* ${product.categoria}`,
    `💚 *Valor no PIX (5% OFF):* ${formatBRL(product.precoPix)}`,
    `💳 *Valor no Cartão:* ${formatBRL(product.precoPor)} (${product.parcelamento})`,
    `📍 *Minha Região no DF:* ${regiaoNome}`,
    ``,
    `Podem confirmar a disponibilidade para *entrega expressa via Motoboy hoje*? 🚀`,
  ].join('\n');

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export function buildConsultantWhatsAppUrl(regiaoNome?: string): string {
  const message = [
    `Olá! Vim pelo site da *RR Store Brasília* 🚀`,
    regiaoNome ? `Estou em *${regiaoNome} - DF* e gostaria de tirar uma dúvida com um consultor sobre os produtos e entrega expressa.` : `Gostaria de falar com um consultor sobre produtos e entrega expressa no DF.`,
  ].join('\n');

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export function buildCheckoutWhatsAppUrl(params: {
  orderCode: string;
  items: CartItem[];
  customer: CustomerCheckoutData;
  region: DFRegion;
  subtotal: number;
  pixDiscount: number;
  shippingCost: number;
  finalTotal: number;
}): string {
  const { orderCode, items, customer, region, subtotal, pixDiscount, shippingCost, finalTotal } = params;

  const itemsLines = items.map((item, idx) => {
    const unitPrice = customer.metodoPagamento === 'pix' ? item.product.precoPix : item.product.precoPor;
    const lineTotal = unitPrice * item.quantity;
    return `${idx + 1}. *${item.quantity}x ${item.product.nome}*\n   • Unitário: ${formatBRL(unitPrice)} | Subtotal: *${formatBRL(lineTotal)}*`;
  });

  let paymentDescription = '';
  if (customer.metodoPagamento === 'pix') {
    paymentDescription = `PIX com 5% de Desconto Imediato (Economia de ${formatBRL(pixDiscount)})`;
  } else if (customer.metodoPagamento === 'credito') {
    const installmentValue = finalTotal / customer.parcelasCredito;
    const modeLabel =
      customer.modoCartao === 'link_seguro'
        ? 'Link de Pagamento Seguro'
        : customer.modoCartao === 'maquininha_entrega'
        ? 'Passar na Maquininha na Entrega (Motoboy)'
        : 'Checkout Online Autorizado';
    paymentDescription = `Cartão de Crédito em *${customer.parcelasCredito}x de ${formatBRL(installmentValue)} sem juros* (${modeLabel})`;
  } else {
    const modeLabel =
      customer.modoCartao === 'maquininha_entrega'
        ? 'Passar na Maquininha na Entrega (Motoboy)'
        : 'Link de Pagamento Débito à Vista';
    paymentDescription = `Cartão de Débito à Vista (${modeLabel})`;
  }

  const message = [
    `✅ *NOVO PEDIDO FINALIZADO - RR STORE BRASÍLIA*`,
    `🔖 *Pedido:* ${orderCode}`,
    `━━━━━━━━━━━━━━━━━━━━`,
    `🛒 *ITENS DO PEDIDO:*`,
    ...itemsLines,
    `━━━━━━━━━━━━━━━━━━━━`,
    `💰 *RESUMO FINANCEIRO:*`,
    `• Subtotal dos Produtos: ${formatBRL(subtotal)}`,
    customer.metodoPagamento === 'pix' ? `• Desconto PIX (5% OFF): -${formatBRL(pixDiscount)}` : null,
    `• Taxa de Entrega (${region.nome}): ${shippingCost === 0 ? 'GRÁTIS 🎉' : formatBRL(shippingCost)}`,
    `🔥 *VALOR TOTAL FINAL: ${formatBRL(finalTotal)}*`,
    `━━━━━━━━━━━━━━━━━━━━`,
    `💳 *FORMA DE PAGAMENTO ESCOLHIDA:*`,
    `• ${paymentDescription}`,
    `━━━━━━━━━━━━━━━━━━━━`,
    `🚚 *DADOS PARA ENTREGA EXPRESSA (DF):*`,
    `• *Cliente:* ${customer.nomeCompleto.trim()}`,
    `• *WhatsApp:* ${customer.whatsapp.trim()}`,
    `• *Região Administrativa:* ${region.nome} - Brasília/DF`,
    customer.cep.trim() ? `• *CEP:* ${customer.cep.trim()}` : null,
    `• *Endereço Completo:* ${customer.enderecoCompleto.trim()}`,
    customer.complemento.trim() ? `• *Complemento/Referência:* ${customer.complemento.trim()}` : null,
    customer.observacoes.trim() ? `• *Observações:* ${customer.observacoes.trim()}` : null,
    `• *Previsão Estimada:* ${region.tempoEstimado}`,
    ``,
    `Aguardo a confirmação para despacho do motoboy! 🚀`,
  ]
    .filter((line): line is string => line !== null)
    .join('\n');

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
