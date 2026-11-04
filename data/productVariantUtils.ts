import { Product } from '../types/store';
import { formatBRL, formatInstallment } from './mockData';

export interface ColorSwatch {
  id: string;
  name: string;
  hex: string;
  borderHex?: string;
}

export interface StorageTier {
  id: string;
  label: string;
  priceDelta: number; // Diferença em relação ao preço base do produto
}

export interface ProductVariantConfig {
  hasVariants: boolean;
  isTechDevice: boolean;
  colors: ColorSwatch[];
  storageTiers: StorageTier[];
  defaultColor: ColorSwatch;
  defaultStorage: StorageTier;
}

const IPHONE_PRO_COLORS: ColorSwatch[] = [
  { id: 'tit-preto', name: 'Titânio Preto', hex: '#212124' },
  { id: 'tit-natural', name: 'Titânio Natural', hex: '#9a9893' },
  { id: 'tit-branco', name: 'Titânio Branco', hex: '#f0f0f2', borderHex: '#d1d1d6' },
  { id: 'tit-deserto', name: 'Titânio Deserto', hex: '#c5b09c' },
];

const IPHONE_BASE_COLORS: ColorSwatch[] = [
  { id: 'preto', name: 'Preto', hex: '#1c1c1e' },
  { id: 'branco', name: 'Branco', hex: '#fafafa', borderHex: '#d1d1d6' },
  { id: 'ultramarino', name: 'Ultramarino', hex: '#3b5575' },
  { id: 'verde', name: 'Verde Menta', hex: '#9dc2b0' },
  { id: 'rosa', name: 'Rosa Suave', hex: '#ebd0da' },
];

const WATCH_COLORS: ColorSwatch[] = [
  { id: 'preto', name: 'Preto / Midnight', hex: '#1c1c1e' },
  { id: 'prata', name: 'Prata / Starlight', hex: '#e5e5ea', borderHex: '#c7c7cc' },
  { id: 'dourado', name: 'Dourado / Rose Gold', hex: '#e4c4b5' },
  { id: 'natural-ultra', name: 'Titânio Natural Ultra', hex: '#9e9b94' },
];

const SAMSUNG_COLORS: ColorSwatch[] = [
  { id: 'titanium-black', name: 'Titanium Black', hex: '#1c1c1e' },
  { id: 'titanium-gray', name: 'Titanium Gray', hex: '#8a8883' },
  { id: 'titanium-violet', name: 'Titanium Violet', hex: '#4e425a' },
  { id: 'titanium-yellow', name: 'Titanium Yellow', hex: '#d9cc99' },
];

const DEFAULT_TECH_COLORS: ColorSwatch[] = [
  { id: 'preto', name: 'Space Black', hex: '#1a1a1a' },
  { id: 'cinza', name: 'Space Gray', hex: '#636366' },
  { id: 'prata', name: 'Silver', hex: '#e5e5ea', borderHex: '#c7c7cc' },
];

export function getProductVariantConfig(product: Product): ProductVariantConfig {
  const name = product.nome.toLowerCase();
  const desc = product.descricao.toLowerCase();
  const isApple = product.id.startsWith('rr-apple-') || name.includes('apple') || name.includes('iphone');
  const isSamsung = name.includes('samsung') || name.includes('galaxy');
  const isXiaomi = name.includes('xiaomi') || name.includes('redmi') || name.includes('poco');
  const isWatch = name.includes('watch') || name.includes('relógio');
  const isMac = name.includes('macbook') || name.includes('mac mini') || name.includes('imac');
  const isIpad = name.includes('ipad');

  const isSmartphone =
    name.includes('iphone') ||
    name.includes('galaxy') ||
    name.includes('xiaomi') ||
    name.includes('redmi') ||
    name.includes('poco') ||
    name.includes('realme');

  const isTechDevice = isSmartphone || isWatch || isMac || isIpad;

  if (!isTechDevice) {
    return {
      hasVariants: false,
      isTechDevice: false,
      colors: [],
      storageTiers: [],
      defaultColor: DEFAULT_TECH_COLORS[0],
      defaultStorage: { id: 'base', label: 'Padrão', priceDelta: 0 },
    };
  }

  // 1. Define Cores
  let colors = DEFAULT_TECH_COLORS;
  if (name.includes('pro')) {
    colors = IPHONE_PRO_COLORS;
  } else if (name.includes('iphone')) {
    colors = IPHONE_BASE_COLORS;
  } else if (isWatch) {
    colors = WATCH_COLORS;
  } else if (isSamsung) {
    colors = SAMSUNG_COLORS;
  }

  // Se o nome já tiver uma cor específica, seleciona ela como default
  let defaultColor = colors[0];
  for (const c of colors) {
    if (name.includes(c.name.toLowerCase()) || name.includes(c.id)) {
      defaultColor = c;
      break;
    }
  }

  // 2. Define Armazenamento / Capacidade
  let storageTiers: StorageTier[] = [];

  if (isWatch) {
    // Para relógios, opções de tamanho de caixa
    if (name.includes('ultra')) {
      storageTiers = [{ id: '49mm', label: '49mm Titanium', priceDelta: 0 }];
    } else if (name.includes('s12') || name.includes('s11') || name.includes('s10')) {
      storageTiers = [
        { id: '42mm', label: '42mm', priceDelta: 0 },
        { id: '46mm', label: '46mm', priceDelta: 200 },
      ];
    } else {
      storageTiers = [
        { id: '40mm', label: '40mm', priceDelta: 0 },
        { id: '44mm', label: '44mm', priceDelta: 250 },
      ];
    }
  } else if (name.includes('pro max') || name.includes('promax')) {
    storageTiers = [
      { id: '256gb', label: '256GB', priceDelta: 0 },
      { id: '512gb', label: '512GB', priceDelta: 950 },
      { id: '1tb', label: '1TB', priceDelta: 1950 },
    ];
  } else if (name.includes('pro') && !name.includes('macbook')) {
    storageTiers = [
      { id: '128gb', label: '128GB', priceDelta: 0 },
      { id: '256gb', label: '256GB', priceDelta: 650 },
      { id: '512gb', label: '512GB', priceDelta: 1650 },
    ];
  } else if (isMac) {
    storageTiers = [
      { id: '256gb', label: '256GB SSD', priceDelta: 0 },
      { id: '512gb', label: '512GB SSD', priceDelta: 1200 },
      { id: '1tb', label: '1TB SSD', priceDelta: 2400 },
    ];
  } else if (isIpad) {
    storageTiers = [
      { id: '128gb', label: '128GB', priceDelta: 0 },
      { id: '256gb', label: '256GB', priceDelta: 600 },
      { id: '512gb', label: '512GB', priceDelta: 1500 },
    ];
  } else if (isSmartphone) {
    storageTiers = [
      { id: '128gb', label: '128GB', priceDelta: 0 },
      { id: '256gb', label: '256GB', priceDelta: 450 },
      { id: '512gb', label: '512GB', priceDelta: 1100 },
    ];
  }

  // Identifica se o produto base já está em 256GB ou 512GB
  let defaultStorage = storageTiers[0] || { id: 'base', label: 'Padrão', priceDelta: 0 };
  if (name.includes('512') && storageTiers.some((s) => s.id.includes('512'))) {
    const match = storageTiers.find((s) => s.id.includes('512'));
    if (match) defaultStorage = match;
  } else if (name.includes('256') && storageTiers.some((s) => s.id.includes('256'))) {
    const match = storageTiers.find((s) => s.id.includes('256'));
    if (match) defaultStorage = match;
  } else if (name.includes('1tb') && storageTiers.some((s) => s.id.includes('1tb'))) {
    const match = storageTiers.find((s) => s.id.includes('1tb'));
    if (match) defaultStorage = match;
  }

  return {
    hasVariants: storageTiers.length > 1 || colors.length > 1,
    isTechDevice: true,
    colors,
    storageTiers,
    defaultColor,
    defaultStorage,
  };
}

export function buildConfiguredProduct(
  baseProduct: Product,
  selectedColor: ColorSwatch,
  selectedStorage: StorageTier
): Product {
  const priceDelta = selectedStorage.priceDelta || 0;
  const newPrecoPix = baseProduct.precoPix + priceDelta;
  const newPrecoPor = baseProduct.precoPor + priceDelta;
  const newPrecoDe = baseProduct.precoDe + Math.round(priceDelta * 1.15);

  const parcelas = newPrecoPor >= 200 ? 12 : newPrecoPor >= 80 ? 6 : 3;
  const newParcelamento = formatInstallment(newPrecoPor, parcelas);

  // Remove qualquer cor/capacidade repetida do nome base
  const cleanName = baseProduct.nome.split(' - ')[0];

  return {
    ...baseProduct,
    id: `${baseProduct.id}-${selectedStorage.id}-${selectedColor.id}`,
    nome: `${cleanName} ${selectedStorage.label} • ${selectedColor.name}`,
    precoDe: newPrecoDe,
    precoPor: newPrecoPor,
    precoPix: newPrecoPix,
    parcelamento: newParcelamento,
  };
}
