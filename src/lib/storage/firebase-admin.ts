import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

let firestoreDb: Firestore | null = null;

function parseServiceAccountKey(keyString: string): any {
  if (!keyString) return null;
  // 1. Direct JSON parse
  try {
    return JSON.parse(keyString);
  } catch {}

  // 2. Base64 decoded JSON parse
  try {
    const decoded = Buffer.from(keyString, 'base64').toString('utf-8');
    return JSON.parse(decoded);
  } catch {}

  // 3. Robust regex fallback for multiline JSON strings with control characters
  try {
    const getField = (field: string) => {
      const regex = new RegExp('\"' + field + '\"\\s*:\\s*\"([\\s\\S]*?)\"(?=,\\s*\"|\\s*})');
      const match = keyString.match(regex);
      return match ? match[1] : null;
    };

    const projectId = getField('project_id');
    const clientEmail = getField('client_email');
    let privateKey = getField('private_key');

    if (projectId && clientEmail && privateKey) {
      if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
        privateKey = privateKey.slice(1, -1);
      }
      return {
        projectId,
        clientEmail,
        privateKey: privateKey.replace(/\\n/g, '\n'),
      };
    }
  } catch {}

  return null;
}

export function getAdminFirestore(): Firestore | null {
  try {
    if (firestoreDb) return firestoreDb;

    // 1. サービスアカウントJSON環境変数（FIREBASE_SERVICE_ACCOUNT_KEY）を優先判定
    const jsonKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    if (jsonKey) {
      const parsed = parseServiceAccountKey(jsonKey);
      if (parsed) {
        if (!getApps().length) {
          initializeApp({ credential: cert(parsed) });
        }
        firestoreDb = getFirestore();
        return firestoreDb;
      }
    }

    // 2. 個別環境変数（FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY）
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    let privateKey = process.env.FIREBASE_PRIVATE_KEY;

    if (!projectId || !clientEmail || !privateKey) {
      return null;
    }

    if (privateKey) {
      if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
        privateKey = privateKey.slice(1, -1);
      }
      if (privateKey.includes('\\n')) {
        privateKey = privateKey.replace(/\\n/g, '\n');
      }
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
