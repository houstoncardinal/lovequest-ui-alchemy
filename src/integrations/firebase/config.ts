// Firebase configuration for LoveQuest
import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';
import { getAnalytics, type Analytics } from 'firebase/analytics';

// Firebase config from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyD07c9zgDWe5ma0sHUvbeXooyNB1hJ8Bo8",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "lovequest-41a43.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "lovequest-41a43",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "lovequest-41a43.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "755087804820",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:755087804820:web:85d7a19793f2bdef106781",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-J1YW5VPSK2"
};

// Initialize Firebase
export const app: FirebaseApp = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);
export const storage: FirebaseStorage = getStorage(app);

// Initialize Analytics (only in browser)
let analytics: Analytics | null = null;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

export { analytics };

// Export config for reference
export { firebaseConfig };
