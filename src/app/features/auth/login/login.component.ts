/**
 * @file LoginComponent
 * @description
 * Pantalla de **inicio de sesión** usando PrimeNG + Formularios Reactivos.
 *
 * Funcionalidad:
 * - Validaciones de campo (`required`, `email`, `minLength`).
 * - Accesibilidad: `id/for`, `aria-invalid`, `aria-describedby`, gestión de foco al error,
 *   y *live region* en plantilla para anunciar errores globales.
 * - Estado de carga con **Signals** y `<button pButton [loading]>`.
 * - “Recuérdame”: guarda el email en `localStorage` (persistencia de sesión opcional en AuthService).
 * - Feedback con `<p-toast>` (PrimeNG `MessageService`) y `<p-message>` global.
 *
 * Requisitos:
 * - PrimeNG v17 (Card, InputText, Password, Checkbox, Button, Message, Toast).
 * - Tema + PrimeIcons importados en `styles.scss`.
 * - `provideAnimations()` en `main.ts` (para overlays como `p-password` con `appendTo="body"`).
 */

import { Component, ElementRef, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';

// PrimeNG
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { CheckboxModule } from 'primeng/checkbox';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

// App
import { AuthService } from '../../../core/services/auth.service';
import { humanizeFirebaseError } from '../../../core/errors/firebase-errors';

/**
 * Componente **standalone** de Login.
 *
 * @example Ruteo (standalone)
 * {
 *   path: 'auth/login',
 *   loadComponent: () => import('./login.component').then(c => c.LoginComponent)
 * }
 */
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    CardModule,
    InputTextModule,
    PasswordModule,
    CheckboxModule,
    ButtonModule,
    MessageModule,
    ToastModule,
  ],
  providers: [MessageService],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  /** Constructor DI helpers */
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private messageService = inject(MessageService);
  private host = inject(ElementRef<HTMLElement>);

  /**
   * Estado de carga del submit.
   * Se expone en plantilla con `loading()`.
   */
  loading = signal(false);

  /**
   * Mensaje de error global (se muestra con `<p-message>` y
   * se anuncia por voz vía *live region* en la plantilla).
   */
  errorMessage: string | null = null;

  /**
   * Formulario reactivo de login.
   *
   * Controles:
   * - `email`: requerido, formato email.
   * - `password`: requerido, minLength 6.
   * - `rememberMe`: bandera para recordar el email.
   */
  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    rememberMe: [false],
  });

  /** Getter de conveniencia: control `email`. */
  get email() {
    return this.loginForm.get('email')!;
  }
  /** Getter de conveniencia: control `password`. */
  get password() {
    return this.loginForm.get('password')!;
  }

  constructor() {
    // Prefill del email si se guardó previamente
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
      this.loginForm.patchValue({ email: rememberedEmail, rememberMe: true });
    }
  }

  /**
   * Devuelve un mensaje legible para el usuario cuando `email` es inválido.
   */
  getEmailError(): string {
    if (this.email.hasError('required')) return 'Debes introducir un email';
    if (this.email.hasError('email')) return 'Introduce un email válido';
    return '';
  }

  /**
   * Devuelve un mensaje legible para el usuario cuando `password` es inválido.
   */
  getPasswordError(): string {
    if (this.password.hasError('required'))
      return 'Debes introducir una contraseña';
    if (this.password.hasError('minlength'))
      return 'La contraseña debe tener al menos 6 caracteres';
    return '';
  }

  /**
   * Enfoca el **primer** control inválido tras un submit fallido.
   * Mejora la accesibilidad con teclado y lectores de pantalla.
   */
  private focusFirstInvalid(): void {
    if (this.email.invalid) {
      document.getElementById('login-email')?.focus();
      return;
    }
    if (this.password.invalid) {
      document.getElementById('login-pass')?.focus();
      return;
    }
  }

  /**
   * Envía el formulario de login.
   *
   * Flujo:
   * 1. Si el formulario no es válido → marca controles, enfoca el primero inválido y retorna.
   * 2. Normaliza valores (`trim`, `email` en minúsculas).
   * 3. Autentica con `AuthService.login`.
   *    - (Opcional) Usa preferencia de persistencia si tu servicio lo soporta.
   * 4. Gestiona “Recuérdame”: guarda/borra el email en `localStorage`.
   * 5. Muestra toast y navega a `/dashboard` usando `replaceUrl`.
   * 6. En error: mapea a mensaje amigable, anuncia por live region y muestra toast.
   */
  async onSubmit(): Promise<void> {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      this.focusFirstInvalid();
      return;
    }

    this.loading.set(true);
    this.errorMessage = null;

    const raw = this.loginForm.value;
    const email = (raw.email ?? '').toString().trim().toLowerCase();
    const password = (raw.password ?? '').toString().trim();
    const rememberMe = !!raw.rememberMe;

    try {
      // Recomendado: pasar preferencia de persistencia al servicio (Firebase setPersistence)
      // await this.authService.login(email, password, { remember: rememberMe });

      await this.authService.login(email, password);

      if (rememberMe) localStorage.setItem('rememberedEmail', email);
      else localStorage.removeItem('rememberedEmail');

      this.messageService.add({
        severity: 'success',
        summary: 'Login correcto',
        detail: 'Bienvenido de nuevo',
        life: 2000,
      });

      this.router.navigate(['/dashboard'], { replaceUrl: true });
    } catch (error: any) {
      const friendly =
        humanizeFirebaseError?.(error?.code) ??
        'Correo o contraseña incorrectos';

      // Para que el lector lo anuncie también si se repite el mismo texto:
      this.errorMessage = null;
      setTimeout(() => (this.errorMessage = friendly));

      this.messageService.add({
        severity: 'error',
        summary: 'No se pudo iniciar sesión',
        detail: friendly,
        life: 4000,
      });

      console.error('Login error:', error);
    } finally {
      this.loading.set(false);
    }
  }
}
