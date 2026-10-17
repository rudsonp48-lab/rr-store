import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
  query,
  limit,
} from 'firebase/firestore';
import { CartItem, CustomerCheckoutData, DFRegion, Product } from '../types/store';

// Configuração Firebase com suporte a Variáveis de Ambiente (Vercel) e fallback pré-configurado
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
}

/**
 * Salva o pedido em segundo plano no Firebase Firestore sem travar o redirecionamento para o WhatsApp
 */
export async function saveOrderToFirebase(order: CloudOrderRecord): Promise<string | null> {
  if (!db) return null;
  try {
    const docRef = await addDoc(collection(db, 'rr_store_orders'), {
      ...order,
      status: 'aguardando_confirmacao_whatsapp',
      cidade: 'Brasília - DF',
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (err) {
    console.warn('Pedido registrado localmente (Firebase offline ou regras restritas):', err);
    return null;
  }
}

/**
 * Busca catálogo atualizado na nuvem caso exista coleção `rr_store_products` no Firestore,
 * mantendo o catálogo estático ultra-rápido como fallback imediato (Zero Loading Spinners).
 */
export async function syncProductsFromFirebase(): Promise<Product[] | null> {
  if (!db) return null;
  try {
    const q = query(collection(db, 'rr_store_products'), limit(50));
    const snap = await getDocs(q);
    if (snap.empty) return null;
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Product, 'id'>) }));
  } catch {
    return null;
  }
}
