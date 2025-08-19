/**
 * @file AuthService
 * @description
 * Servicio centralizado de autenticación para TimeLogic basado en **Firebase Auth**.
 *
 * Responsabilidades:
 *  - Gestionar **login / logout / registro**.
 *  - Gestionar **persistencia** (recordar sesión vs sesión de pestaña).
 *  - Exponer el **idToken** vigente y avisar cuando Firebase termina de
 *    restaurar la sesión al arrancar la app.
 *  - Utilidades de **roles** (custom claims), **reset de contraseña** y
 *    **verificación de email**.
 *
 * Notas importantes:
 *  - Se usa `onIdTokenChanged` para mantener el token actualizado
 *    (incluye refresh automático de Firebase).
 *  - Temporalmente se guarda el token en `localStorage` como _fallback_ para
 *    el interceptor; en producción se recomienda migrar a **cookies HttpOnly**
 *    emitidas por vuestro backend.
 *
 * Requisitos:
 *  - AngularFire `@angular/fire/auth` (v9+).
 *  - Si tu bundler marca error con `setPersistence` o `browser*Persistence`,
 *    impórtalos desde `firebase/auth` en lugar de `@angular/fire/auth`.
 */

import { Injectable, inject } from '@angular/core';
import {
  Auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  User,
  onIdTokenChanged,
  getIdToken,
  getIdTokenResult,
  sendPasswordResetEmail,
  sendEmailVerification,
} from '@angular/fire/auth';
import { BehaviorSubject, ReplaySubject } from 'rxjs';
import { setPersistence, browserLocalPersistence, browserSessionPersistence } from 'firebase/auth';

@Injectable({ providedIn: 'root' })
export class AuthService {
  /** Instancia de Firebase Auth inyectada. */
  private auth = inject(Auth);

  /**
   * Último **idToken** emitido por Firebase (o `null` si no hay sesión).
   * Se actualiza automáticamente con `onIdTokenChanged`.
   */
  private tokenSubject = new BehaviorSubject<string | null>(null);

  /**
   * Observable público del token. Útil si quieres reaccionar a los cambios
   * de sesión en alguna parte de la UI.
   */
  readonly token$ = this.tokenSubject.asObservable();

  /**
   * Señaliza que Firebase **terminó de restaurar** la sesión al bootstrapping
   * de la app (evita flicker/redirecciones erróneas en guards).
   *
   * @example
   * await firstValueFrom(authService.authReady$.pipe(filter(Boolean), take(1)));
   */
  private readySubject = new ReplaySubject<boolean>(1);

  /** Observable público de "auth lista". Emite `true` al menos una vez. */
  readonly authReady$ = this.readySubject.asObservable();

  /**
   * Constructor: se suscribe a `onIdTokenChanged` para:
   *  - Mantener el token actualizado (incluye refresh).
   *  - Anunciar cuándo Firebase ha resuelto el estado de sesión.
   */
  constructor() {
    onIdTokenChanged(this.auth, async (user: User | null) => {
      if (user) {
        // Token fresco (sin forzar refresh explícito)
        const token = await user.getIdToken();
        this.tokenSubject.next(token);

        // Fallback temporal. Recomendado migrar a cookie HttpOnly en backend.
        localStorage.setItem('token', token);
      } else {
        this.tokenSubject.next(null);
        localStorage.removeItem('token');
      }

      // Marca que ya conocemos el estado de auth (con o sin usuario)
      this.readySubject.next(true);
    });
  }

  /**
   * Inicia sesión con email y contraseña.
   *
   * @param email Email del usuario.
   * @param password Contraseña del usuario.
   * @param opts Opciones de persistencia:
   *  - `remember: true` → persistencia **local** (permanece al cerrar el navegador).
   *  - `remember: false` → persistencia **de sesión** (se pierde al cerrar pestaña).
   *
   * @throws Propaga errores de Firebase (`auth/invalid-credential`, etc.)
   *
   * @example
   * await authService.login(email, password, { remember: true });
   */
  async login(
    email: string,
    password: string,
    opts?: { remember?: boolean }
  ): Promise<void> {
    if (opts && 'remember' in opts) {
      try {
        await setPersistence(
          this.auth,
          opts.remember ? browserLocalPersistence : browserSessionPersistence
        );
      } catch (e) {
        // En entornos con storage restringido, continúa con persistencia por defecto.
        console.warn('setPersistence falló, continúo con default:', e);
      }
    }

    await signInWithEmailAndPassword(this.auth, email, password);
    // El token se actualizará vía onIdTokenChanged
  }

  /**
   * Registra un usuario (solo credenciales de Auth).
   * Los datos de perfil extendido deberán guardarse en el backend propio.
   *
   * @param email Email de registro.
   * @param password Contraseña.
   */
  async register(email: string, password: string): Promise<void> {
    await createUserWithEmailAndPassword(this.auth, email, password);
    // El token se actualizará vía onIdTokenChanged
  }

  /**
   * Cierra la sesión actual y limpia el estado local.
   * Aun si `signOut` lanza error, se intenta dejar el estado coherente.
   */
  async logout(): Promise<void> {
    try {
      await signOut(this.auth);
    } finally {
      this.tokenSubject.next(null);
      localStorage.removeItem('token'); // pendiente migrar a cookie HttpOnly
    }
  }

  /**
   * Devuelve el token **actual** si existe (no fuerza refresh).
   * Para asegurar frescura, usa {@link getValidToken}.
   */
  getToken(): string | null {
    return this.tokenSubject.value || localStorage.getItem('token');
  }

  /**
   * Devuelve un **token válido** (refrescado si corresponde por ciclo de vida).
   * @returns `idToken` o `null` si no hay usuario autenticado.
   */
  async getValidToken(): Promise<string | null> {
    const user = this.auth.currentUser;
    if (!user) return null;
    return await getIdToken(user, /* forceRefresh */ false);
  }

  /**
   * Lee el **rol principal** del usuario desde *custom claims*.
   * Si usas `roles: string[]`, toma el primero; si usas `role: string`, lo devuelve.
   *
   * @returns Rol o `null` si no hay sesión o no hay claims.
   */
  async getUserRole(): Promise<string | null> {
    const user = this.auth.currentUser;
    if (!user) return null;

    const res = await getIdTokenResult(user);
    const claims: any = res.claims || {};

    if (Array.isArray(claims.roles) && claims.roles.length)
      return claims.roles[0];
    return claims.role ?? null;
  }

  /**
   * Indica si el usuario posee **alguno** de los roles solicitados.
   *
   * @param wanted Rol o lista de roles requeridos.
   * @returns `true` si hay intersección; `false` en otro caso o sin sesión.
   */
  async hasAnyRole(wanted: string | string[]): Promise<boolean> {
    const user = this.auth.currentUser;
    if (!user) return false;

    const res = await getIdTokenResult(user);
    const claims: any = res.claims || {};

    const set = new Set<string>(
      Array.isArray(claims.roles)
        ? claims.roles
        : claims.role
        ? [claims.role]
        : []
    );
    const need = Array.isArray(wanted) ? wanted : [wanted];

    return need.some((r) => set.has(r));
  }

  /**
   * Solicita un **correo de restablecimiento de contraseña**.
   * Si el email no existe, **no se revela** (se silencian `auth/user-not-found`)
   * para evitar *account enumeration*.
   *
   * @param email Email al que se enviará el enlace de reset.
   */
  async requestPasswordReset(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(this.auth, email);
    } catch (e: any) {
      if (e?.code === 'auth/user-not-found') return; // respuesta genérica
      throw e;
    }
  }

  /**
   * Fuerza la recarga del objeto `User` (refresca `emailVerified` y claims).
   * @returns Usuario actualizado o `null` si no hay sesión.
   */
  async refreshUser(): Promise<User | null> {
    const user = this.auth.currentUser;
    if (!user) return null;
    await user.reload();
    return this.auth.currentUser;
  }

  /**
   * Comprueba si, **tras refrescar el usuario**, el email está verificado.
   * Útil después de volver desde el enlace de verificación.
   */
  async isEmailVerifiedNow(): Promise<boolean> {
    const u = await this.refreshUser();
    return !!u?.emailVerified;
  }

  /**
   * Envía (o reenvía) el **correo de verificación** al usuario actual.
   * @throws Error si no hay usuario autenticado.
   */
  async sendEmailVerificationEmail(): Promise<void> {
    const user = this.auth.currentUser;
    if (!user) throw new Error('No user logged in');
    await sendEmailVerification(user);
  }
}
