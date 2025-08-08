export function authErrorToRoMessage(code?: string): string {
  switch (code) {
    case 'auth/invalid-email':
      return 'Adresa de email este invalidă.'
    case 'auth/user-disabled':
      return 'Contul a fost dezactivat.'
    case 'auth/user-not-found':
      return 'Utilizatorul nu există.'
    case 'auth/wrong-password':
      return 'Parola este incorectă.'
    case 'auth/email-already-in-use':
      return 'Email deja folosit.'
    case 'auth/weak-password':
      return 'Parola este prea slabă.'
    case 'auth/too-many-requests':
      return 'Prea multe încercări. Încercați mai târziu.'
    default:
      return 'A apărut o eroare de autentificare. Încercați din nou.'
  }
}