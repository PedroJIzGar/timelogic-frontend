// src/app/core/services/auth.service.ts
import { Injectable, inject } from '@angular/core';
import {
  Auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  User,
  onIdTokenChanged,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  getIdToken,
  getIdTokenResult,
  sendPasswordResetEmail,
} from '@angular/fire/auth';
import { BehaviorSubject, firstValueFrom, ReplaySubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private auth = inject(Auth);

  /** Último token idToken emitido (puede ser null). */
  private tokenSubject = new BehaviorSubject<string | null>(null);
  token$ = this.tokenSubject.asObservable();

  /** Señaliza que Firebase terminó de restaurar sesión (evita “flicker” en guards). */
  private readySubject = new ReplaySubject<boolean>(1);
  authReady$ = this.readySubject.asObservable();

  constructor() {
    // Escucha cualquier cambio de idToken (incluye refresh automático de Firebase)
    onIdTokenChanged(this.auth, async (user: User | null) => {
      if (user) {
        const token = await user.getIdToken(); // token fresco
        this.tokenSubject.next(token);
        // Fallback temporal si aún usas Authorization header
        localStorage.setItem('token', token);
      } else {
        this.tokenSubject.next(null);
        localStorage.removeItem('token');
      }
      this.readySubject.next(true);
    });
  }

  /** Login con opción de persistencia (remember). */
  async login(
    email: string,
    password: string,
    opts?: { remember?: boolean }
  ): Promise<void> {
    await setPersistence(
      this.auth,
      opts?.remember ? browserLocalPersistence : browserSessionPersistence
    );
    await signInWithEmailAndPassword(this.auth, email, password);
    // onIdTokenChanged actualizará el tokenSubject por nosotros
  }

  /** Registro (solo auth). El perfil extra se guardará en tu backend después. */
  async register(email: string, password: string): Promise<void> {
    await createUserWithEmailAndPassword(this.auth, email, password);
    // onIdTokenChanged actualizará el tokenSubject
  }

  /** Logout completo. */
  async logout(): Promise<void> {
    await signOut(this.auth);
  }

  /** Devuelve el token actual (o null). No fuerza refresh. */
  getToken(): string | null {
    return this.tokenSubject.value || localStorage.getItem('token');
  }

  /** Devuelve SIEMPRE un token válido (refresca si toca). */
  async getValidToken(): Promise<string | null> {
    const user = this.auth.currentUser;
    if (!user) return null;
    return await getIdToken(user, /* forceRefresh */ false);
  }

  /** Lee custom claims para roles (si los estableces desde tu backend). */
  async getUserRole(): Promise<string | null> {
    const user = this.auth.currentUser;
    if (!user) return null;
    const res = await getIdTokenResult(user);
    // p.ej. { role: 'admin' } o { roles: ['admin'] }
    const claims: any = res.claims || {};
    return claims.role ?? null;
  }

  /** Envía email de restablecimiento de contraseña (Firebase). */
  async requestPasswordReset(email: string): Promise<void> {
    // Firebase disparará el correo si la cuenta existe; si no, lanza error,
    // pero en UI devolvemos mensaje genérico para no filtrar si existe o no.
    await sendPasswordResetEmail(this.auth, email);
  }
}
