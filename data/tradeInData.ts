import { formatBRL, WHATSAPP_NUMBER } from './mockData';
import { Product } from '../types/store';

export type TradeInBrand = 'Apple' | 'Samsung' | 'Xiaomi';

export type DeviceCondition = 'excelente' | 'bom' | 'marcas';

export interface TradeInModel {
  id: string;
  brand: TradeInBrand;
  name: string;
  category: string;
  storageOptions: {
    storage: string;
    baseValue: number; // Valor de avaliação base (condição excelente)
  }[];
}

export const TRADE_IN_MODELS: TradeInModel[] = [
  // Apple iPhones
  {
    id: 'apple-ip11',
    brand: 'Apple',
    name: 'iPhone 11',
    category: 'iPhone',
    storageOptions: [
      { storage: '64GB', baseValue: 1150 },
      { storage: '128GB', baseValue: 1300 },
    ],
  },
  {
    id: 'apple-ip11pro',
    brand: 'Apple',
    name: 'iPhone 11 Pro / Pro Max',
    category: 'iPhone',
    storageOptions: [
      { storage: '64GB', baseValue: 1400 },
      { storage: '256GB', baseValue: 1650 },
      { storage: '512GB', baseValue: 1800 },
    ],
  },
  {
    id: 'apple-ip12',
    brand: 'Apple',
    name: 'iPhone 12',
    category: 'iPhone',
    storageOptions: [
      { storage: '64GB', baseValue: 1550 },
      { storage: '128GB', baseValue: 1750 },
      { storage: '256GB', baseValue: 1950 },
    ],
  },
  {
    id: 'apple-ip12pro',
    brand: 'Apple',
    name: 'iPhone 12 Pro / Pro Max',
    category: 'iPhone',
    storageOptions: [
      { storage: '128GB', baseValue: 2150 },
      { storage: '256GB', baseValue: 2400 },
      { storage: '512GB', baseValue: 2600 },
    ],
  },
  {
    id: 'apple-ip13',
    brand: 'Apple',
    name: 'iPhone 13',
    category: 'iPhone',
    storageOptions: [
      { storage: '128GB', baseValue: 2450 },
      { storage: '256GB', baseValue: 2750 },
      { storage: '512GB', baseValue: 3000 },
    ],
  },
  {
    id: 'apple-ip13pro',
    brand: 'Apple',
    name: 'iPhone 13 Pro',
    category: 'iPhone',
    storageOptions: [
      { storage: '128GB', baseValue: 2950 },
      { storage: '256GB', baseValue: 3300 },
      { storage: '512GB', baseValue: 3600 },
    ],
  },
  {
    id: 'apple-ip13promax',
    brand: 'Apple',
    name: 'iPhone 13 Pro Max',
    category: 'iPhone',
    storageOptions: [
      { storage: '128GB', baseValue: 3300 },
      { storage: '256GB', baseValue: 3650 },
      { storage: '512GB', baseValue: 3950 },
      { storage: '1TB', baseValue: 4200 },
    ],
  },
  {
    id: 'apple-ip14',
    brand: 'Apple',
    name: 'iPhone 14 / 14 Plus',
    category: 'iPhone',
    storageOptions: [
      { storage: '128GB', baseValue: 2850 },
      { storage: '256GB', baseValue: 3200 },
      { storage: '512GB', baseValue: 3500 },
    ],
  },
  {
    id: 'apple-ip14pro',
    brand: 'Apple',
    name: 'iPhone 14 Pro',
    category: 'iPhone',
    storageOptions: [
      { storage: '128GB', baseValue: 3650 },
      { storage: '256GB', baseValue: 4050 },
      { storage: '512GB', baseValue: 4400 },
    ],
  },
  {
    id: 'apple-ip14promax',
    brand: 'Apple',
    name: 'iPhone 14 Pro Max',
    category: 'iPhone',
    storageOptions: [
      { storage: '128GB', baseValue: 4000 },
      { storage: '256GB', baseValue: 4400 },
      { storage: '512GB', baseValue: 4750 },
      { storage: '1TB', baseValue: 5050 },
    ],
  },
  {
    id: 'apple-ip15',
    brand: 'Apple',
    name: 'iPhone 15 / 15 Plus',
    category: 'iPhone',
    storageOptions: [
      { storage: '128GB', baseValue: 3550 },
      { storage: '256GB', baseValue: 3950 },
      { storage: '512GB', baseValue: 4350 },
    ],
  },
  {
    id: 'apple-ip15pro',
    brand: 'Apple',
    name: 'iPhone 15 Pro',
    category: 'iPhone',
    storageOptions: [
      { storage: '128GB', baseValue: 4500 },
      { storage: '256GB', baseValue: 4950 },
      { storage: '512GB', baseValue: 5450 },
      { storage: '1TB', baseValue: 5900 },
    ],
  },
  {
    id: 'apple-ip15promax',
    brand: 'Apple',
    name: 'iPhone 15 Pro Max',
    category: 'iPhone',
    storageOptions: [
      { storage: '256GB', baseValue: 5350 },
      { storage: '512GB', baseValue: 5850 },
      { storage: '1TB', baseValue: 6300 },
    ],
  },

  // Samsung Galaxy
  {
    id: 'sam-s22',
    brand: 'Samsung',
    name: 'Galaxy S22 / S22+',
    category: 'Samsung',
    storageOptions: [
      { storage: '128GB', baseValue: 1350 },
      { storage: '256GB', baseValue: 1550 },
    ],
  },
  {
    id: 'sam-s22ultra',
    brand: 'Samsung',
    name: 'Galaxy S22 Ultra',
    category: 'Samsung',
    storageOptions: [
      { storage: '256GB', baseValue: 2050 },
      { storage: '512GB', baseValue: 2300 },
    ],
  },
  {
    id: 'sam-s23',
    brand: 'Samsung',
    name: 'Galaxy S23 / S23+',
    category: 'Samsung',
    storageOptions: [
      { storage: '128GB', baseValue: 1950 },
      { storage: '256GB', baseValue: 2250 },
      { storage: '512GB', baseValue: 2500 },
    ],
  },
  {
    id: 'sam-s23ultra',
    brand: 'Samsung',
    name: 'Galaxy S23 Ultra',
    category: 'Samsung',
    storageOptions: [
      { storage: '256GB', baseValue: 2950 },
      { storage: '512GB', baseValue: 3300 },
      { storage: '1TB', baseValue: 3600 },
    ],
  },
  {
    id: 'sam-s24ultra',
    brand: 'Samsung',
    name: 'Galaxy S24 Ultra',
    category: 'Samsung',
    storageOptions: [
      { storage: '256GB', baseValue: 4300 },
      { storage: '512GB', baseValue: 4750 },
    ],
  },
  {
    id: 'sam-zflip',
    brand: 'Samsung',
    name: 'Galaxy Z Flip 4 / 5',
    category: 'Samsung',
    storageOptions: [
      { storage: '256GB', baseValue: 1850 },
      { storage: '512GB', baseValue: 2150 },
    ],
  },

  // Xiaomi
  {
    id: 'xiaomi-note13pro',
    brand: 'Xiaomi',
    name: 'Redmi Note 13 Pro / Pro+ 5G',
    category: 'Xiaomi',
    storageOptions: [
      { storage: '256GB', baseValue: 950 },
      { storage: '512GB', baseValue: 1200 },
    ],
  },
  {
    id: 'xiaomi-pocox6',
    brand: 'Xiaomi',
    name: 'Poco X6 / X6 Pro 5G',
    category: 'Xiaomi',
    storageOptions: [
      { storage: '256GB', baseValue: 900 },
      { storage: '512GB', baseValue: 1150 },
    ],
  },
  {
    id: 'xiaomi-pocof6',
    brand: 'Xiaomi',
    name: 'Poco F5 / F6 Pro',
    category: 'Xiaomi',
    storageOptions: [
      { storage: '256GB', baseValue: 1450 },
      { storage: '512GB', baseValue: 1750 },
    ],
  },
];

export const CONDITION_MULTIPLIERS: Record<
  DeviceCondition,
  { label: string; desc: string; factor: number; badgeColor: string }
> = {
  excelente: {
    label: 'Excelente (Como Novo)',
    desc: 'Bateria 85%+, tela original sem riscos, tudo funcionando perfeitamente.',
    factor: 1.0,
    badgeColor: 'text-emerald-400 border-emerald-500/40 bg-emerald-950/40',
  },
  bom: {
    label: 'Bom (Uso Normal)',
    desc: 'Bateria entre 80% e 84%, pequenos sinais normais de capinha ou aro.',
    factor: 0.88,
    badgeColor: 'text-blue-400 border-blue-500/40 bg-blue-950/40',
  },
  marcas: {
    label: 'Com Marcas Visíveis',
    desc: 'Bateria <80% ou marcas de uso nítidas (sem trincos na tela ou traseira).',
    factor: 0.75,
    badgeColor: 'text-amber-400 border-amber-500/40 bg-amber-950/40',
  },
};

export function calculateTradeInValue(
  baseValue: number,
  condition: DeviceCondition,
  customMultiplier: number = 1.0
): number {
  const condFactor = CONDITION_MULTIPLIERS[condition]?.factor || 1.0;
  return Math.round(baseValue * condFactor * customMultiplier);
}

export function buildTradeInWhatsAppUrl(params: {
  usedModelName: string;
  usedStorage: string;
  condition: DeviceCondition;
  evaluatedValue: number;
  targetProduct: Product;
  differencePix: number;
  deliveryMethod?: 'loja' | 'motoboy';
  customerRegion?: string;
}): string {
  const condLabel = CONDITION_MULTIPLIERS[params.condition]?.label || 'Excelente';
  const methodText =
    params.deliveryMethod === 'motoboy'
      ? `🛵 Entrega via Motoboy no DF (${params.customerRegion || 'Brasília'})`
      : '🏢 Retirada e Avaliação Presencial na Loja D439 (SIA)';

  const lines = [
    '👋 *Olá equipe RR Store Brasília!*',
    'Acabei de fazer uma *Simulação de Troca (Trade-In)* pelo site oficial:',
    '',
    '📱 *Meu Aparelho Atual (Entrada):*',
    `• *Modelo:* ${params.usedModelName} (${params.usedStorage})`,
    `• *Condição:* ${condLabel}`,
    `• *Estimativa do Site:* ~${formatBRL(params.evaluatedValue)}`,
    '',
    '🎯 *Aparelho Novo que Desejo Comprar:*',
    `• *Produto:* ${params.targetProduct.nome}`,
    `• *Valor de Vitrine:* ${formatBRL(params.targetProduct.precoPix)} no PIX`,
    '',
    '💰 *Volta Estimada a Pagar:*',
    `• *No PIX:* ~${formatBRL(params.differencePix)}`,
    `• *Ou Cartão:* em até 12x (conforme operadora)`,
    '',
    `📍 *Preferência:* ${methodText}`,
    '',
    'Podem confirmar a disponibilidade do novo aparelho para eu levar o meu na Loja D439 ou receber o motoboy hoje? 🚀',
  ];

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join('\n'))}`;
}
