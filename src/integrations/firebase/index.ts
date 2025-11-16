// Firebase integration exports for LoveQuest
// Import like this: import { auth, db, storage } from '@/integrations/firebase';

export { app, auth, db, storage, analytics, firebaseConfig } from './config';

// Re-export commonly used Firebase functions for convenience
export {
  // Auth
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  updateEmail,
  updatePassword,
  deleteUser,
  type User,
  type UserCredential,
} from 'firebase/auth';

export {
  // Firestore
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  endBefore,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  type DocumentData,
  type QueryDocumentSnapshot,
  type DocumentSnapshot,
  type CollectionReference,
  type DocumentReference,
  type Query,
  type WhereFilterOp,
  type OrderByDirection,
  writeBatch,
  increment,
  arrayUnion,
  arrayRemove,
  FieldValue,
} from 'firebase/firestore';

export {
  // Storage
  ref,
  uploadBytes,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  listAll,
  type StorageReference,
  type UploadResult,
  type UploadTask,
  type UploadMetadata,
} from 'firebase/storage';

export {
  // Analytics
  logEvent,
  setUserId,
  setUserProperties,
} from 'firebase/analytics';
