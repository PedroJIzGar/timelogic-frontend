/**
 * @file RegisterComponent
 * @description
 * Página de registro de TimeLogic.
 * - Formulario reactivo con validaciones de campo y de grupo.
 * - Manejo de estados de carga con `signal`.
 * - Feedback al usuario mediante PrimeNG `MessageService` y `<p-toast>`.
 * - No persiste datos de perfil (nombre) en Firebase: solo autenticación.
 *   Los datos extra se enviarán al backend cuando esté disponible.
 */

import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';

// PrimeNG
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { AuthService } from '../../../core/services/auth.service';
import { humanizeFirebaseError } from '../../../core/errors/firebase-errors';

/**
 * Componente de registro de usuarios.
 *
 * @component
 * @example
 * <app-register></app-register>
 *
 * @remarks
 * - Requiere `<p-toast>` en la plantilla para visualizar notificaciones.
 * - Para el medidor de fortaleza de `p-password`, la app debe proveer animaciones
 *   vía `provideAnimations()` en `main.ts`. Además, usamos `appendTo="body"` para
 *   evitar clipping dentro de la card con overflow.
 */
@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    CardModule,
    InputTextModule,
    PasswordModule,
    ButtonModule,
    ToastModule,
  ],
  providers: [MessageService],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent {
  /** Builder para crear el formulario reactivo. */
  private fb = inject(FormBuilder);
  /** Servicio de autenticación (solo login/register Firebase por ahora). */
  private auth = inject(AuthService);
  /** Router para navegación tras el registro. */
  private router = inject(Router);
  /** Servicio de mensajes (toasts). */
  private messages = inject(MessageService);

  /**
   * Estado de carga del submit.
   * `signal` nos permite una API simple y reactiva en plantilla: `loading()`.
   */
  loading = signal(false);

  /**
   * Formulario de registro.
   *
   * Controles:
   * - `name`: requerido, mínimo 2 chars.
   * - `email`: requerido, formato email.
   * - `password`: requerido, mínimo 6 chars.
   * - `repeatPassword`: requerido.
   *
   * Validador de grupo:
   * - `notMatching`: asegura que `password` y `repeatPassword` coinciden.
   */
  registerForm = this.fb.group(
    {
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      repeatPassword: ['', Validators.required],
    },
    {
      validators: (group) =>
        group.get('password')?.value === group.get('repeatPassword')?.value
          ? null
          : { notMatching: true },
    }
  );

  // ------------------ Getters de conveniencia para la plantilla ------------------

  /** Control reactivo: nombre. */
  get name() {
    return this.registerForm.get('name')!;
  }
  /** Control reactivo: email. */
  get email() {
    return this.registerForm.get('email')!;
  }
  /** Control reactivo: contraseña. */
  get password() {
    return this.registerForm.get('password')!;
  }
  /** Control reactivo: repetición de contraseña. */
  get repeatPassword() {
    return this.registerForm.get('repeatPassword')!;
  }

  // ------------------ Mensajes de error de validación ------------------

  /**
   * Mensaje de error para el campo nombre.
   * @returns Texto legible para el usuario o cadena vacía si no hay error.
   */
  getNameError() {
    if (this.name.hasError('required')) return 'El nombre es obligatorio.';
    if (this.name.hasError('minlength')) return 'Mínimo 2 caracteres.';
    return '';
  }

  /**
   * Mensaje de error para el campo email.
   * @returns Texto legible para el usuario o cadena vacía si no hay error.
   */
  getEmailError() {
    if (this.email.hasError('required')) return 'El correo es obligatorio.';
    if (this.email.hasError('email')) return 'Correo no válido.';
    return '';
  }

  /**
   * Mensaje de error para el campo contraseña.
   * @returns Texto legible para el usuario o cadena vacía si no hay error.
   */
  getPasswordError() {
    if (this.password.hasError('required'))
      return 'La contraseña es obligatoria.';
    if (this.password.hasError('minlength')) return 'Mínimo 6 caracteres.';
    return '';
  }

  /**
   * Mensaje de error para el campo repetición de contraseña.
   * Incluye el error de formulario `notMatching`.
   * @returns Texto legible para el usuario o cadena vacía si no hay error.
   */
  getRepeatPasswordError() {
    if (this.repeatPassword.hasError('required'))
      return 'Repite la contraseña.';
    if (this.registerForm.hasError('notMatching'))
      return 'Las contraseñas no coinciden.';
    return '';
  }

  // ------------------ Submit ------------------

  /**
   * Envía el formulario de registro.
   *
   * Flujo:
   * 1. Marca controles si el formulario es inválido.
   * 2. Normaliza `email` y `password` (trim; email en minúsculas).
   * 3. Llama a `auth.register(email, password)` (solo autenticación).
   * 4. Muestra toast y navega a `/auth/login` con `replaceUrl` para no volver atrás.
   * 5. Mapea y muestra errores de Firebase en toasts en caso de fallo.
   *
   * @returns Promise<void>
   */
  async onSubmit() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);

    // Normalización básica (evita “espacios fantasma” y correos con mayúsculas)
    const name = (this.name.value as string).trim();
    const email = (this.email.value as string).trim().toLowerCase();
    const password = (this.password.value as string).trim();

    try {
      // 1) Registro en Firebase (solo auth). No guardamos `name` aquí.
      await this.auth.register(email, password);

      // 2) Cuando exista backend:
      // const idToken = await this.auth.getIdToken();
      // await this.auth.bootstrapProfile({ name }, idToken);

      // Feedback de éxito
      this.messages.add({
        severity: 'success',
        summary: 'Registro correcto',
        life: 2200,
      });

      // Navegación: evitamos que el usuario vuelva al form tras registrarse
      this.router.navigate(['/auth/login'], { replaceUrl: true });
    } catch (e: any) {
      // Mapeo de errores de Firebase a mensajes amigables
      this.messages.add({
        severity: 'error',
        summary: 'No se pudo registrar',
        detail: humanizeFirebaseError?.(e?.code) ?? 'Error desconocido',
        life: 4000,
      });
    } finally {
      this.loading.set(false);
    }
  }
}
