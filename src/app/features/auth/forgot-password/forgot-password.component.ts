/**
 * @file ForgotPasswordComponent
 * @description
 * Pantalla para solicitar restablecimiento de contraseña (Firebase).
 *
 * UX/A11y:
 * - Form reactivo con validaciones (required + email).
 * - Accesibilidad: id/for, aria-invalid, aria-describedby, aria-busy.
 * - Live region para anunciar mensajes globales a lectores de pantalla.
 * - Loading con signal y botón PrimeNG [loading].
 * - Mensaje de éxito genérico (evita enumeración de cuentas).
 *
 * Notas:
 * - Tras enviar, redirigimos a /auth/login.
 * - El servicio AuthService encapsula sendPasswordResetEmail.
 */

import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';

import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    CardModule,
    InputTextModule,
    ButtonModule,
    MessageModule,
    ToastModule,
  ],
  providers: [MessageService],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
})
export class ForgotPasswordComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private messages = inject(MessageService);

  loading = signal(false);
  errorMessage: string | null = null;

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  get email() {
    return this.form.get('email')!;
  }

  getEmailError(): string {
    if (this.email.hasError('required')) return 'Debes introducir un email';
    if (this.email.hasError('email')) return 'Introduce un email válido';
    return '';
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      document.getElementById('fp-email')?.focus();
      return;
    }

    this.loading.set(true);
    this.errorMessage = null;

    const email = (this.email.value as string).trim().toLowerCase();

    try {
      await this.auth.requestPasswordReset(email);
      // Mensaje genérico para evitar enumeración de cuentas
      this.messages.add({
        severity: 'success',
        summary: 'Revisa tu correo',
        detail:
          'Si existe una cuenta con ese email, te hemos enviado instrucciones.',
        life: 4000,
      });
      // Pequeño delay opcional para que vea el toast antes de navegar
      setTimeout(
        () => this.router.navigate(['/auth/login'], { replaceUrl: true }),
        400
      );
    } catch (e) {
      // Mismo mensaje para no revelar si el email existe o no
      this.messages.add({
        severity: 'success',
        summary: 'Revisa tu correo',
        detail:
          'Si existe una cuenta con ese email, te hemos enviado instrucciones.',
        life: 4000,
      });
      console.error('ForgotPassword error:', e);
      setTimeout(
        () => this.router.navigate(['/auth/login'], { replaceUrl: true }),
        400
      );
    } finally {
      this.loading.set(false);
    }
  }
}
