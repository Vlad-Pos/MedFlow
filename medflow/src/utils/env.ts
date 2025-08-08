export function isDemoMode(): boolean {
  const key = (import.meta as any).env?.VITE_FIREBASE_API_KEY
  return !key || key === 'REPLACE_WITH_REAL_API_KEY'
}