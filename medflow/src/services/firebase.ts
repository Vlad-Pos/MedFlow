import { auth as authJs, db as dbJs, storage as storageJs } from '../firebase'

// Re-export JS Firebase singletons for TypeScript consumers
export const auth = authJs
export const db = dbJs
export const storage = storageJs