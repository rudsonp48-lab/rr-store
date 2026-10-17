import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  collection,
  addDoc,
  getDocs,
  query,
  limit,
} from 'firebase/firestore';
import { PRODUCTS, DF_REGIONS } from '../data/mockData';

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

async function main() {
  console.log('🔥 Conectando ao Firebase Firestore (Projeto:', firebaseConfig.projectId, ')...');
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  // 1. Gravar catálogo inicial de 30 produtos
  await setDoc(doc(db, 'rr_store_settings', 'catalog'), {
    products: PRODUCTS,
    totalCount: PRODUCTS.length,
    updatedAtIso: new Date().toISOString(),
  });
  console.log('✅ Catálogo salvo em rr_store_settings/catalog:', PRODUCTS.length, 'produtos');

  // 2. Gravar fretes das 12 Regiões Administrativas do DF
  await setDoc(doc(db, 'rr_store_settings', 'shipping'), {
    regions: DF_REGIONS,
    totalRegions: DF_REGIONS.length,
    updatedAtIso: new Date().toISOString(),
  });
  console.log('✅ Taxas de frete DF salvas em rr_store_settings/shipping:', DF_REGIONS.length, 'localidades');

  // 3. Ler de volta para confirmar armazenamento real no banco
  const catSnap = await getDoc(doc(db, 'rr_store_settings', 'catalog'));
  const shipSnap = await getDoc(doc(db, 'rr_store_settings', 'shipping'));
  const ordersSnap = await getDocs(query(collection(db, 'rr_store_orders'), limit(5)));

  console.log('📊 Verificação de leitura no Firestore:');
  console.log('   - Catálogo armazenado?', catSnap.exists(), '| Total:', catSnap.data()?.totalCount);
  console.log('   - Fretes DF armazenados?', shipSnap.exists(), '| Total:', shipSnap.data()?.totalRegions);
  console.log('   - Pedidos na coleção rr_store_orders:', ordersSnap.size);
  process.exit(0);
}

main().catch((err) => {
  console.error('❌ Erro ao acessar Firestore:', err.message || err);
  process.exit(1);
});
