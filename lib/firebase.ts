import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  collection,
  addDoc,
  setDoc,
  getDoc,
  doc,
  serverTimestamp,
  getDocs,
  query,
  orderBy,
  limit,
} from 'firebase/firestore';
import { CustomerCheckoutData, DFRegion, Product } from '../types/store';

// Configuração Firebase com suporte a Variáveis de Ambiente (Vercel) e projeto pré-configurado
export const FIREBASE_PROJECT_ID =
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'landing-page-d9c04';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyDSyJsWUpg8ac4wZBia0-I_L5i3z75m8ak',
  authDomain:
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'landing-page-d9c04.firebaseapp.com',
  projectId: FIREBASE_PROJECT_ID,
  storageBucket:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'landing-page-d9c04.firebasestorage.app',
  messagingSenderId:
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '634016980321',
  appId:
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:634016980321:web:0b333de40437f4c60c7920',
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Firestore otimizado com Cache Persistente Local (IndexedDB Multi-Tab) para carregamento instantâneo
export const db =
  typeof window !== 'undefined'
    ? initializeFirestore(app, {
        localCache: persistentLocalCache({
          tabManager: persistentMultipleTabManager(),
        }),
      })
    : null;

export interface CloudOrderRecord {
  id?: string;
  orderCode: string;
  customer: CustomerCheckoutData;
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
  createdAtIso?: string;
}

/**
 * 1. Salva o pedido no Firebase Firestore (`rr_store_orders`) e mantém espelho local de segurança
 */
export async function saveOrderToFirebase(order: CloudOrderRecord): Promise<string | null> {
  const payload = {
    ...order,
    status: 'aguardando_confirmacao_whatsapp',
    cidade: 'Brasília - DF',
    createdAtIso: new Date().toISOString(),
  };

  // Salva espelho local imediato para exibição instantânea no Painel Admin
  if (typeof window !== 'undefined') {
    try {
      const existing = JSON.parse(localStorage.getItem('rr_store_orders_v1') || '[]');
      localStorage.setItem(
        'rr_store_orders_v1',
        JSON.stringify([{ id: order.orderCode, ...payload }, ...existing].slice(0, 50))
      );
    } catch {
      // Ignore storage error
    }
  }

  if (!db) return null;
  try {
    const docRef = await addDoc(collection(db, 'rr_store_orders'), {
      ...payload,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (err) {
    console.warn('Pedido salvo no cache persistente local (Firestore):', err);
    return null;
  }
}

/**
 * 2. Busca os últimos pedidos gravados no Firebase Firestore (`rr_store_orders`)
 */
export async function fetchOrdersFromFirebase(): Promise<CloudOrderRecord[]> {
  let localOrders: CloudOrderRecord[] = [];
  if (typeof window !== 'undefined') {
    try {
      localOrders = JSON.parse(localStorage.getItem('rr_store_orders_v1') || '[]');
    } catch {
      localOrders = [];
    }
  }

  if (!db) return localOrders;
  try {
    const q = query(
      collection(db, 'rr_store_orders'),
      orderBy('createdAtIso', 'desc'),
      limit(25)
    );
    const snap = await getDocs(q);
    if (snap.empty) return localOrders;
    const cloudOrders = snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as CloudOrderRecord),
    }));
    return cloudOrders.length > 0 ? cloudOrders : localOrders;
  } catch {
    return localOrders;
  }
}

/**
 * 3. Salva o catálogo completo gerenciado no Painel Admin direto no Firebase Firestore (`rr_store_settings/catalog`)
 */
export async function saveCatalogToFirebase(products: Product[]): Promise<boolean> {
  if (!db) return false;
  try {
    await setDoc(doc(db, 'rr_store_settings', 'catalog'), {
      products,
      totalCount: products.length,
      updatedAtIso: new Date().toISOString(),
      updatedAt: serverTimestamp(),
    });
    return true;
  } catch (err) {
    console.warn('Catálogo mantido em cache persistente IndexedDB:', err);
    return false;
  }
}

/**
 * 4. Carrega o catálogo de produtos salvo no Firebase Firestore (`rr_store_settings/catalog`)
 */
export async function loadCatalogFromFirebase(): Promise<Product[] | null> {
  if (!db) return null;
  try {
    const snap = await getDoc(doc(db, 'rr_store_settings', 'catalog'));
    if (snap.exists()) {
      const data = snap.data();
      if (Array.isArray(data?.products) && data.products.length > 0) {
        return data.products as Product[];
      }
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * 5. Salva as taxas de frete por localidade do DF no Firebase Firestore (`rr_store_settings/shipping`)
 */
export async function saveRegionsToFirebase(regions: DFRegion[]): Promise<boolean> {
  if (!db) return false;
  try {
    await setDoc(doc(db, 'rr_store_settings', 'shipping'), {
      regions,
      updatedAtIso: new Date().toISOString(),
      updatedAt: serverTimestamp(),
    });
    return true;
  } catch (err) {
    console.warn('Fretes DF mantidos em cache persistente IndexedDB:', err);
    return false;
  }
}

/**
 * 6. Carrega as taxas de frete por localidade do DF salvas no Firebase Firestore
 */
export async function loadRegionsFromFirebase(): Promise<DFRegion[] | null> {
  if (!db) return null;
  try {
    const snap = await getDoc(doc(db, 'rr_store_settings', 'shipping'));
    if (snap.exists()) {
      const data = snap.data();
      if (Array.isArray(data?.regions) && data.regions.length > 0) {
        return data.regions as DFRegion[];
      }
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * 7. Verifica em tempo real a conexão e gravação com o Firebase Firestore
 */
export async function verifyFirebaseConnection(
  currentProducts: Product[],
  currentRegions: DFRegion[]
): Promise<{
  ok: boolean;
  projectId: string;
  message: string;
  syncedAt: string;
}> {
  const nowStr = new Date().toLocaleTimeString('pt-BR');
  if (!db) {
    return {
      ok: false,
      projectId: FIREBASE_PROJECT_ID,
      message: 'Cliente Firestore aguardando ambiente de navegador.',
      syncedAt: nowStr,
    };
  }

  try {
    await setDoc(doc(db, 'rr_store_settings', 'catalog'), {
      products: currentProducts,
      totalCount: currentProducts.length,
      updatedAtIso: new Date().toISOString(),
      updatedAt: serverTimestamp(),
    });
    await setDoc(doc(db, 'rr_store_settings', 'shipping'), {
      regions: currentRegions,
      updatedAtIso: new Date().toISOString(),
      updatedAt: serverTimestamp(),
    });
    return {
      ok: true,
      projectId: FIREBASE_PROJECT_ID,
      message: `Conectado e gravando em nuvem no projeto "${FIREBASE_PROJECT_ID}" (Coleções: rr_store_settings & rr_store_orders).`,
      syncedAt: nowStr,
    };
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    return {
      ok: false,
      projectId: FIREBASE_PROJECT_ID,
      message: `Cache Local IndexedDB Ativo. Detalhe da nuvem (${FIREBASE_PROJECT_ID}): ${errMsg}`,
      syncedAt: nowStr,
    };
  }
}
