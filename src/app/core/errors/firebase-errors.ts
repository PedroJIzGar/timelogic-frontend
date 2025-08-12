// core/errors/firebase-errors.ts
export function humanizeFirebaseError(code?: string): string {
  switch (code) {
    case 'auth/email-already-in-use': return 'Este correo ya está registrado.';
    case 'auth/weak-password':        return 'La contraseña es demasiado débil.';
    case 'auth/invalid-email':        return 'El correo no es válido.';
    case 'auth/invalid-credential':
    case 'auth/wrong-password':       return 'Credenciales incorrectas.';
    case 'auth/network-request-failed': return 'Problema de red. Inténtalo de nuevo.';
    default: return 'Error desconocido. Vuelve a intentarlo.';
  }
}
