import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  getDocFromServer,
  Firestore,
} from 'firebase/firestore';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  Auth,
} from 'firebase/auth';
import { firebaseConfig, isFirebaseConfigured } from './firebaseConfig';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

let appInstance: FirebaseApp | null = null;
let dbInstance: Firestore | null = null;
let authInstance: Auth | null = null;

export function getFirebaseApp(): FirebaseApp | null {
  if (!isFirebaseConfigured()) return null;
  if (appInstance) return appInstance;
  try {
    appInstance = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    return appInstance;
  } catch (err) {
    console.warn('Erro ao inicializar Firebase App:', err);
    return null;
  }
}

export function getDb(): Firestore | null {
  if (!isFirebaseConfigured()) return null;
  if (dbInstance) return dbInstance;

  try {
    const app = getFirebaseApp();
    if (!app) return null;

    // Inicializa o Firestore com o Database ID configurado
    dbInstance =
      firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
        ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
        : getFirestore(app);

    // Teste de conexão silencioso
    testConnection(dbInstance);

    return dbInstance;
  } catch (err) {
    console.warn('Erro ao inicializar Firebase Firestore:', err);
    return null;
  }
}

export function getFirebaseAuth(): Auth | null {
  if (!isFirebaseConfigured()) return null;
  if (authInstance) return authInstance;

  try {
    const app = getFirebaseApp();
    if (!app) return null;
    authInstance = getAuth(app);
    return authInstance;
  } catch (err) {
    console.warn('Erro ao inicializar Firebase Auth:', err);
    return null;
  }
}

async function testConnection(db: Firestore) {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Aviso: Firestore cliente offline ou aguardando conexão.');
    }
  }
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): FirestoreErrorInfo {
  const auth = getFirebaseAuth();
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid,
      email: auth?.currentUser?.email,
      emailVerified: auth?.currentUser?.emailVerified,
      isAnonymous: auth?.currentUser?.isAnonymous,
      tenantId: auth?.currentUser?.tenantId,
      providerInfo:
        auth?.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
  return errInfo;
}

export class FirebaseService {
  static isAvailable(): boolean {
    return isFirebaseConfigured();
  }

  static getAuth(): Auth | null {
    return getFirebaseAuth();
  }

  static getCurrentUser(): FirebaseUser | null {
    const auth = getFirebaseAuth();
    return auth?.currentUser || null;
  }

  static onAuthChange(callback: (user: FirebaseUser | null) => void): () => void {
    const auth = getFirebaseAuth();
    if (!auth) {
      callback(null);
      return () => {};
    }
    return onAuthStateChanged(auth, callback);
  }

  static async loginWithGoogle(): Promise<FirebaseUser | null> {
    const auth = getFirebaseAuth();
    if (!auth) {
      throw new Error('Firebase Auth não inicializado.');
    }

    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const credential = await signInWithPopup(auth, provider);
      return credential.user;
    } catch (err: any) {
      console.error('Erro no login do Google:', err);
      throw err;
    }
  }

  static async logout(): Promise<void> {
    const auth = getFirebaseAuth();
    if (auth) {
      await signOut(auth);
    }
  }

  static async syncProgress(userId: string, progressData: any): Promise<boolean> {
    const db = getDb();
    if (!db || !userId) return false;

    const path = `users/${userId}`;
    try {
      const userRef = doc(db, 'users', userId);
      await setDoc(
        userRef,
        {
          ...progressData,
          lastSyncedAt: new Date().toISOString(),
        },
        { merge: true }
      );
      return true;
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
      return false;
    }
  }

  static async restoreProgress(userId: string): Promise<any | null> {
    const db = getDb();
    if (!db || !userId) return null;

    const path = `users/${userId}`;
    try {
      const userRef = doc(db, 'users', userId);
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        return snap.data();
      }
      return null;
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, path);
      return null;
    }
  }
}

