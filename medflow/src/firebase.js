// Firebase initialization for MedFlow (JS)
import { initializeApp, getApps } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: "AIzaSyCV4-CXiwvn0H_v6ns1ZfeEmVWrff1sBSc",
  authDomain: "med-schedule-1.firebaseapp.com",
  projectId: "med-schedule-1",
  storageBucket: "med-schedule-1.firebasestorage.app",
  messagingSenderId: "36397792612",
  appId: "1:36397792612:web:586dbda4c92caa43840e71",
  measurementId: "G-JRQM10JMDK"
}

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)