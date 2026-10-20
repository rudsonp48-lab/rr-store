import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  initializeFirestore,
  getFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  collection,
  addDoc,
  getDocs,
  serverTimestamp,
  type Firestore,
} from 'firebase/firestore';
import { CustomerCheckoutData, DFRegion, HeroBanner, Product } from '../types/store';

/**
 * Camada de dados do SITE PÚBLICO.
 *
 * Regra: o site só LÊ o catálogo/fretes/banners e só CRIA pedidos.
 * Toda escrita de catálogo, fretes e banners é feita pelo projeto separado `rr-store-admin`
 * (autenticado). As regras do Firestore (firestore.rules) reforçam isso no servidor.
 */
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyDSyJsWUpg8ac4wZBia0-I_L5i3z75m8ak',
  authDomain:
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'landing-page-d9c04.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'landing-page-d9c04',
  storageBucket:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'landing-page-d9c04.firebasestorage.app',
  messagingSenderId:
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '634016980321',
  appId:
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:634016980321:web:0b333de40437f4c60c7920',
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

function createDb(): Firestore | null {
  if (typeof window === 'undefined') return null;
  try {
    // Cache persistente (IndexedDB) para abrir a loja instantaneamente nas próximas visitas
    return initializeFirestore(app, {
      localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
    });
  } catch {
    // Já inicializado (hot reload) ou IndexedDB indisponível
    return getFirestore(app);
  }
}

export const db = createDb();

export interface StoreSettings {
  products: Product[] | null;
  regions: DFRegion[] | null;
  banners: HeroBanner[] | null;
}

/**
 * Lê catálogo, fretes e banners publicados pelo painel admin (1 única consulta).
 * Retorna `null` nos campos ausentes para o site usar o catálogo padrão embutido.
 */
export async function loadStoreSettings(): Promise<StoreSettings> {
  const result: StoreSettings = { products: null, regions: null, banners: null };
  if (!db) return result;
  try {
    const snap = await getDocs(collection(db, 'rr_store_settings'));
    snap.forEach((d) => {
      const data = d.data();
      if (d.id === 'catalog' && Array.isArray(data.products) && data.products.length > 0) {
        result.products = data.products as Product[];
      }
      if (d.id === 'shipping' && Array.isArray(data.regions) && data.regions.length > 0) {
        result.regions = data.regions as DFRegion[];
      }
      if (d.id === 'banners' && Array.isArray(data.banners)) {
        result.banners = data.banners as HeroBanner[];
      }
    });
  } catch (err) {
    console.warn('Firestore indisponível, usando catálogo padrão embutido:', err);
  }
  return result;
}

// Dados de cartão NUNCA são enviados ao banco de dados.
type SafeCustomer = Omit<
  CustomerCheckoutData,
  'numeroCartaoSimulado' | 'nomeImpressoCartao' | 'validadeCartao' | 'cvvCartao'
>;

export interface CloudOrderRecord {
  orderCode: string;
  customer: SafeCustomer;
  region: DFRegion;
  items: Array<{
    id: string;
    nome: string;
    categoria: string;
    quantity: number;
    precoUnitario: number;
  }>;
  subtotal: number;
  pixDiscount: number;
  shippingCost: number;
  finalTotal: number;
}

/**
 * Registra o pedido em `rr_store_orders` (somente criação). Não bloqueia o fluxo do WhatsApp.
 */
export async function saveOrderToFirebase(
  order: Omit<CloudOrderRecord, 'customer'> & { customer: CustomerCheckoutData }
): Promise<string | null> {
  if (!db) return null;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { numeroCartaoSimulado, nomeImpressoCartao, validadeCartao, cvvCartao, ...safeCustomer } =
    order.customer;

  try {
    const docRef = await addDoc(collection(db, 'rr_store_orders'), {
      ...order,
      customer: safeCustomer,
      status: 'aguardando_confirmacao_whatsapp',
      cidade: 'Brasília - DF',
      createdAtIso: new Date().toISOString(),
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (err) {
    console.warn('Não foi possível registrar o pedido na nuvem:', err);
    return null;
  }
}
