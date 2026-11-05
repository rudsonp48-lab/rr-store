import { Product } from '../types/store';
import { PRODUCTS } from './mockData';

export interface ColorSwatch {
  id: string;
  name: string;
  hex: string;
  secondaryHex?: string;
  borderHex?: string;
  glowColor?: string;
  targetProductId?: string;
}

export interface StorageTier {
  id: string;
  label: string;
  price?: number;
  targetProductId?: string;
}

export interface ProductVariantConfig {
  isTechDevice: boolean;
  hasColorOptions: boolean;
  hasStorageOptions: boolean;
  currentColor: ColorSwatch | null;
  availableColors: ColorSwatch[];
  currentStorage: StorageTier | null;
  availableStorages: StorageTier[];
  officialSpecBadge?: string;
  modelFamilyName: string;
}

// Catálogo Mestre de Cores Oficiais com Acabamento e HEX Metálico Realista
const COLOR_DEFINITIONS: Record<
  string,
  { name: string; hex: string; secondaryHex?: string; borderHex?: string; glowColor?: string }
> = {
  bordo: {
    name: 'Bordô',
    hex: '#5C1D2E',
    borderHex: '#3E121E',
    glowColor: 'rgba(92, 29, 46, 0.45)',
  },
  'laranja-cosmico': {
    name: 'Laranja Cósmico',
    hex: '#E36836',
    borderHex: '#C44F1F',
    glowColor: 'rgba(227, 104, 54, 0.45)',
  },
  'azul-intenso': {
    name: 'Azul Intenso',
    hex: '#234975',
    borderHex: '#173354',
    glowColor: 'rgba(35, 73, 117, 0.45)',
  },
  azul: {
    name: 'Azul',
    hex: '#28496E',
    borderHex: '#1B3450',
    glowColor: 'rgba(40, 73, 110, 0.45)',
  },
  'azul-celeste': {
    name: 'Azul Celeste',
    hex: '#387BB2',
    borderHex: '#265E8C',
    glowColor: 'rgba(56, 123, 178, 0.45)',
  },
  'azul-indigo': {
    name: 'Azul (Índigo)',
    hex: '#284364',
    borderHex: '#1A2F49',
    glowColor: 'rgba(40, 67, 100, 0.45)',
  },
  silver: {
    name: 'Silver (Prateado)',
    hex: '#E2E4E8',
    borderHex: '#CBD0D8',
    glowColor: 'rgba(226, 228, 232, 0.55)',
  },
  starlight: {
    name: 'Starlight (Estelar)',
    hex: '#EFE7DE',
    borderHex: '#D9CFBF',
    glowColor: 'rgba(239, 231, 222, 0.45)',
  },
  midnight: {
    name: 'Midnight (Meia-Noite)',
    hex: '#19202B',
    borderHex: '#0F151E',
    glowColor: 'rgba(25, 32, 43, 0.55)',
  },
  preto: {
    name: 'Preto / Space Black',
    hex: '#1C1C1E',
    borderHex: '#0A0A0A',
    glowColor: 'rgba(28, 28, 30, 0.55)',
  },
  grafite: {
    name: 'Grafite / Space Gray',
    hex: '#4B4D53',
    borderHex: '#36383D',
    glowColor: 'rgba(75, 77, 83, 0.45)',
  },
  'titanium-gray': {
    name: 'Titanium Gray',
    hex: '#727479',
    borderHex: '#57595D',
    glowColor: 'rgba(114, 116, 121, 0.45)',
  },
  'tit-natural': {
    name: 'Titânio Natural',
    hex: '#9E9B94',
    borderHex: '#7E7A73',
    glowColor: 'rgba(158, 155, 148, 0.45)',
  },
  'rose-gold': {
    name: 'Rose Gold',
    hex: '#E5A898',
    borderHex: '#C98878',
    glowColor: 'rgba(229, 168, 152, 0.45)',
  },
  'dourado-bordo': {
    name: 'Dourado + Pulseira Bordô',
    hex: '#CFAC4B',
    secondaryHex: '#5C1D2E',
    borderHex: '#B08E35',
    glowColor: 'rgba(207, 172, 75, 0.45)',
  },
  'ouro-dourado': {
    name: 'Ouro Dourado',
    hex: '#D4AF37',
    borderHex: '#B8952B',
    glowColor: 'rgba(212, 175, 55, 0.45)',
  },
  citrus: {
    name: 'Citrus',
    hex: '#D2DE38',
    borderHex: '#B5C122',
    glowColor: 'rgba(210, 222, 56, 0.45)',
  },
  roxo: {
    name: 'Roxo Cósmico',
    hex: '#6B3C8C',
    borderHex: '#4E2868',
    glowColor: 'rgba(107, 60, 140, 0.45)',
  },
  'verde-gamer': {
    name: 'Verde Gamer',
    hex: '#1E7E34',
    borderHex: '#145A24',
    glowColor: 'rgba(30, 126, 52, 0.45)',
  },
  branco: {
    name: 'Branco',
    hex: '#FFFFFF',
    borderHex: '#D1D5DB',
    glowColor: 'rgba(255, 255, 255, 0.6)',
  },
  'camuflado-grey': {
    name: 'Camuflado Grey',
    hex: '#5E6360',
    borderHex: '#464B48',
    glowColor: 'rgba(94, 99, 96, 0.45)',
  },
};

/**
 * Detecta a cor oficial e específica do produto com base no seu nome, id e descrição.
 */
export function detectProductColor(product: Product): ColorSwatch | null {
  const name = product.nome;
  const desc = product.descricao || '';
  const id = product.id.toLowerCase();
  const text = `${name} ${desc} ${id}`.toLowerCase();

  // 1. Tenta extrair a cor após o hífen ' - ' no nome
  let rawColor = '';
  if (name.includes(' - ')) {
    const parts = name.split(' - ');
    const lastPart = parts[parts.length - 1].trim();
    // Limpa complementos como (Zerou no Estoque), (Lacrado), etc.
    const clean = lastPart
      .replace(/\(Zerou no Estoque\)/gi, '')
      .replace(/\(Lacrado\)/gi, '')
      .replace(/\(Sem Lacre e Sem Ativação\)/gi, '')
      .replace(/\(Americano [^)]+\)/gi, '')
      .replace(/\s+/g, ' ')
      .trim();

    // Se não for código de produto
    if (clean && !/^[A-Z0-9\/]{6,}$/.test(clean)) {
      rawColor = clean;
    }
  }

  const rawLower = rawColor.toLowerCase();

  // Mapeamento prioritário
  if (rawLower.includes('dourado') && (rawLower.includes('bordô') || rawLower.includes('bordo'))) {
    return { id: 'dourado-bordo', ...COLOR_DEFINITIONS['dourado-bordo'] };
  }
  if (rawLower.includes('bordô') || rawLower.includes('bordo') || id.includes('bordo')) {
    return { id: 'bordo', ...COLOR_DEFINITIONS['bordo'] };
  }
  if (rawLower.includes('laranja') || id.includes('laranja')) {
    return { id: 'laranja-cosmico', ...COLOR_DEFINITIONS['laranja-cosmico'] };
  }
  if (rawLower.includes('azul intenso') || id.includes('azul-intenso')) {
    return { id: 'azul-intenso', ...COLOR_DEFINITIONS['azul-intenso'] };
  }
  if (rawLower.includes('azul celeste') || id.includes('azul-celeste')) {
    return { id: 'azul-celeste', ...COLOR_DEFINITIONS['azul-celeste'] };
  }
  if (rawLower.includes('índigo') || rawLower.includes('indigo')) {
    return { id: 'azul-indigo', ...COLOR_DEFINITIONS['azul-indigo'] };
  }
  if (rawLower.includes('rose gold') || rawLower.includes('ouro rosa') || id.includes('rosegold')) {
    return { id: 'rose-gold', ...COLOR_DEFINITIONS['rose-gold'] };
  }
  if (rawLower.includes('ouro dourado')) {
    return { id: 'ouro-dourado', ...COLOR_DEFINITIONS['ouro-dourado'] };
  }
  if (rawLower.includes('starlight') || rawLower.includes('estelar') || id.includes('starlight')) {
    return { id: 'starlight', ...COLOR_DEFINITIONS['starlight'] };
  }
  if (rawLower.includes('midnight') || id.includes('midnight')) {
    return { id: 'midnight', ...COLOR_DEFINITIONS['midnight'] };
  }
  if (rawLower.includes('citrus') || id.includes('citrus')) {
    return { id: 'citrus', ...COLOR_DEFINITIONS['citrus'] };
  }
  if (rawLower.includes('verde gamer') || id.includes('verde')) {
    return { id: 'verde-gamer', ...COLOR_DEFINITIONS['verde-gamer'] };
  }
  if (rawLower.includes('camuflado') || id.includes('camu')) {
    return { id: 'camuflado-grey', ...COLOR_DEFINITIONS['camuflado-grey'] };
  }
  if (rawLower.includes('titanium gray') || id.includes('titanium-gray')) {
    return { id: 'titanium-gray', ...COLOR_DEFINITIONS['titanium-gray'] };
  }
  if (rawLower.includes('grafite') || id.includes('grafite')) {
    return { id: 'grafite', ...COLOR_DEFINITIONS['grafite'] };
  }
  if (rawLower.includes('gray') || rawLower.includes('cinza') || id.includes('gray')) {
    return { id: 'grafite', ...COLOR_DEFINITIONS['grafite'], name: 'Gray' };
  }
  if (rawLower.includes('silver') || rawLower.includes('pratead') || id.includes('silver')) {
    return { id: 'silver', ...COLOR_DEFINITIONS['silver'] };
  }
  if (rawLower.includes('branco') || rawLower.includes('white') || id.includes('branco')) {
    return { id: 'branco', ...COLOR_DEFINITIONS['branco'] };
  }
  if (rawLower.includes('roxo') || id.includes('roxo')) {
    return { id: 'roxo', ...COLOR_DEFINITIONS['roxo'] };
  }
  if (
    rawLower.includes('preto') ||
    rawLower.includes('preta') ||
    rawLower.includes('black') ||
    id.includes('preto') ||
    id.includes('black')
  ) {
    return { id: 'preto', ...COLOR_DEFINITIONS['preto'] };
  }
  if (rawLower.includes('azul') || id.includes('azul')) {
    return { id: 'azul', ...COLOR_DEFINITIONS['azul'] };
  }
  if (rawLower.includes('natural') || id.includes('natural')) {
    return { id: 'tit-natural', ...COLOR_DEFINITIONS['tit-natural'] };
  }

  // Se não foi identificado pelo sufixo do nome, analisa palavras-chave no texto
  if (text.includes('bordô') || text.includes('bordo')) {
    return { id: 'bordo', ...COLOR_DEFINITIONS['bordo'] };
  }
  if (text.includes('laranja cósmico') || text.includes('laranja-cósmico')) {
    return { id: 'laranja-cosmico', ...COLOR_DEFINITIONS['laranja-cosmico'] };
  }
  if (text.includes('rose gold')) {
    return { id: 'rose-gold', ...COLOR_DEFINITIONS['rose-gold'] };
  }
  if (text.includes('starlight')) {
    return { id: 'starlight', ...COLOR_DEFINITIONS['starlight'] };
  }
  if (text.includes('citrus')) {
    return { id: 'citrus', ...COLOR_DEFINITIONS['citrus'] };
  }
  if (text.includes('verde gamer')) {
    return { id: 'verde-gamer', ...COLOR_DEFINITIONS['verde-gamer'] };
  }

  return null;
}

/**
 * Normaliza o nome do produto para o modelo puro (removendo cor e detalhes específicos).
 */
export function getPureModelName(productName: string): string {
  let base = productName;
  if (base.includes(' - ')) {
    base = base.split(' - ')[0].trim();
  }
  // Remove capacidades conhecidas (128GB, 256GB, 512GB, 1TB, etc.)
  const pure = base
    .replace(/\b(128gb|256gb|512gb|1tb|64gb|32gb|240gb|16gb ram|8gb ram|4gb ram|8gb|12gb ram)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
  return pure;
}

/**
 * Extrai a capacidade declarada no título ou descrição.
 */
export function extractStorageLabel(productName: string): string | null {
  const matchWatch = productName.match(/\b(40mm|42mm|44mm|46mm|49mm)\b/i);
  if (matchWatch) return matchWatch[1].toUpperCase();

  const matchStorage = productName.match(/\b(128GB|256GB|512GB|1TB|240GB)\b/i);
  if (matchStorage) return matchStorage[1].toUpperCase();

  return null;
}

/**
 * Retorna as especificações de variantes e irmãos no catálogo para o produto.
 */
export function getProductVariantConfig(
  product: Product,
  catalog: Product[] = PRODUCTS
): ProductVariantConfig {
  const pureModel = getPureModelName(product.nome);
  const currentColor = detectProductColor(product);
  const currentStorageLabel = extractStorageLabel(product.nome);

  const isApple = product.id.startsWith('rr-apple-') || product.nome.toLowerCase().includes('apple');
  const isSmartphone =
    /iphone|galaxy|redmi|poco|realme|smartphone/i.test(product.nome);
  const isWatch = /watch|relógio|smartwatch/i.test(product.nome);
  const isLaptopOrTablet = /macbook|ipad/i.test(product.nome);
  const isTechDevice = isSmartphone || isWatch || isLaptopOrTablet || isApple;

  // Busca produtos irmãos que pertencem à mesma família de modelo no catálogo
  const siblings = catalog.filter((item) => {
    return getPureModelName(item.nome).toLowerCase() === pureModel.toLowerCase();
  });

  // Mapeia Cores Reais do Catálogo
  const colorMap = new Map<string, ColorSwatch>();
  if (currentColor) {
    colorMap.set(currentColor.id, { ...currentColor, targetProductId: product.id });
  }

  for (const sib of siblings) {
    const sibColor = detectProductColor(sib);
    if (sibColor && !colorMap.has(sibColor.id)) {
      colorMap.set(sibColor.id, { ...sibColor, targetProductId: sib.id });
    }
  }

  const availableColors = Array.from(colorMap.values());
  const hasColorOptions = availableColors.length > 1;

  // Mapeia Capacidades Reais do Catálogo
  const storageMap = new Map<string, StorageTier>();
  if (currentStorageLabel) {
    storageMap.set(currentStorageLabel, {
      id: currentStorageLabel.toLowerCase(),
      label: currentStorageLabel,
      price: product.precoPix,
      targetProductId: product.id,
    });
  }

  for (const sib of siblings) {
    const sibStorage = extractStorageLabel(sib.nome);
    if (sibStorage && !storageMap.has(sibStorage)) {
      storageMap.set(sibStorage, {
        id: sibStorage.toLowerCase(),
        label: sibStorage,
        price: sib.precoPix,
        targetProductId: sib.id,
      });
    }
  }

  const availableStorages = Array.from(storageMap.values());
  const hasStorageOptions = availableStorages.length > 1;

  // Badge de especificação oficial se não houver múltiplos botões
  let officialSpecBadge = '';
  if (currentStorageLabel) {
    if (isWatch) {
      officialSpecBadge = `Caixa ${currentStorageLabel}`;
    } else {
      // Extrai RAM se existir (ex: 8GB RAM, 12GB RAM)
      const ramMatch = product.nome.match(/\b(\d+GB\s+RAM)\b/i);
      officialSpecBadge = ramMatch
        ? `${currentStorageLabel} • ${ramMatch[1].toUpperCase()}`
        : `${currentStorageLabel} Oficial`;
    }
  } else if (isApple && !isTechDevice) {
    officialSpecBadge = '100% Original Apple';
  }

  return {
    isTechDevice,
    hasColorOptions,
    hasStorageOptions,
    currentColor,
    availableColors,
    currentStorage: currentStorageLabel
      ? {
          id: currentStorageLabel.toLowerCase(),
          label: currentStorageLabel,
          price: product.precoPix,
          targetProductId: product.id,
        }
      : null,
    availableStorages,
    officialSpecBadge,
    modelFamilyName: pureModel,
  };
}

/**
 * Cria uma cópia do produto com a variante selecionada (se não for irmão direto no catálogo).
 */
export function buildConfiguredProduct(
  baseProduct: Product,
  selectedColor?: ColorSwatch | null,
  selectedStorage?: StorageTier | null
): Product {
  let nome = baseProduct.nome;

  // Se o usuário selecionou uma cor diferente, reflete no nome com elegância
  if (selectedColor && !nome.toLowerCase().includes(selectedColor.name.toLowerCase())) {
    const baseClean = nome.split(' - ')[0];
    nome = `${baseClean} - ${selectedColor.name}`;
  }

  return {
    ...baseProduct,
    nome,
  };
}
