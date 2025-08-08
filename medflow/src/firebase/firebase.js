import { initializeApp, getApps } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore'

// Configurați din variabile de mediu sau completați manual pentru dezvoltare
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyCV4-CXiwvn0H_v6ns1ZfeEmVWrff1sBSc',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'med-schedule-1.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'med-schedule-1',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'med-schedule-1.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '36397792612',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:36397792612:web:586dbda4c92caa43840e71',
}

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const firestore = getFirestore(app)

export async function saveUserToFirestore(user, role = 'doctor') {
  const ref = doc(firestore, 'users', user.uid)
  await setDoc(ref, {
    uid: user.uid,
    email: user.email,
    role,
    createdAt: serverTimestamp(),
  }, { merge: true })
}