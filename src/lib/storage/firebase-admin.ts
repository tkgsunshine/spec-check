import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

let firestoreDb: Firestore | null = null;

export function getAdminFirestore(): Firestore | null {
  try {
    if (firestoreDb) return firestoreDb;

    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    let privateKey = process.env.FIREBASE_PRIVATE_KEY;

    if (!projectId || !clientEmail || !privateKey) {
      // サービスアカウントJSON文字列が指定されている場合
      const jsonKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
      if (jsonKey) {
        try {
          const parsed = JSON.parse(jsonKey);
          if (!getApps().length) {
            initializeApp({ credential: cert(parsed) });
          }
          firestoreDb = getFirestore();
          return firestoreDb;
        } catch (e) {
          console.error('Firebase Service Account Key Parse Error:', e);
        }
      }
      return null;
    }

    // \n のエスケープ解除処理
    if (privateKey && privateKey.includes('\\n')) {
      privateKey = privateKey.replace(/\\n/g, '\n');
    }

    if (!getApps().length) {
      initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
    }
    firestoreDb = getFirestore();
    return firestoreDb;
  } catch (error) {
    console.error('Firebase Admin Initialization Error:', error);
    return null;
  }
}
