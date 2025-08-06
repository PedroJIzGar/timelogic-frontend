import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

// Angular Material Modules
import { MatCardModule } from "@angular/material/card";
import { MatFormFieldModule } from '@angular/material/form-field';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCheckboxModule } from '@angular/material/checkbox';

/**
 * LoginComponent
 * --------------
 * Componente standalone que gestiona la pantalla de login de usuario.
 * Incluye:
 *  - Formulario reactivo con validación.
 *  - Mostrar/ocultar contraseña.
 *  - Recuerda email con "recuérdame".
 *  - Notificaciones de éxito/error con MatSnackBar.
 *  - Accesibilidad y feedback de carga.
 */
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCheckboxModule,
    MatSnackBarModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatInputModule,
    MatCardModule,
    MatFormFieldModule,
    ReactiveFormsModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {

  /** Controla si la contraseña está oculta (por defecto true) */
  hidePassword = true;

  /** Formulario reactivo de login */
  loginForm: FormGroup;

  /** Estado de carga al enviar formulario */
  loading = false;

  /** Mensaje de error general para mostrar en la vista */
  errorMessage: string | null = null;

  /**
   * Constructor.
   * @param fb - FormBuilder para crear el formulario reactivo
   * @param authService - Servicio de autenticación personalizado
   * @param router - Router de Angular para navegación
   * @param snackBar - MatSnackBar para notificaciones
   */
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    // Inicializa el formulario con validadores
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });

    // Rellena email si está guardado en localStorage
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
      this.loginForm.patchValue({ email: rememberedEmail, rememberMe: true });
    }
  }

  /**
   * Cambia la visibilidad de la contraseña.
   * Usado por el botón de ojo (mat-icon).
   */
  togglePassword(): void {
    this.hidePassword = !this.hidePassword;
  }

  /**
   * Getter para el control de email en el formulario.
   * @returns FormControl de email
   * @throws Error si el control no existe
   */
  get email() {
    const control = this.loginForm.get('email');
    if (!control) throw new Error('El control email no existe');
    return control;
  }

  /**
   * Getter para el control de password en el formulario.
   * @returns FormControl de password
   * @throws Error si el control no existe
   */
  get password() {
    const control = this.loginForm.get('password');
    if (!control) throw new Error('El control password no existe');
    return control;
  }

  /**
   * Devuelve el mensaje de error para el email (si existe).
   * @returns string con el mensaje de error adecuado
   */
  getEmailError(): string {
    if (this.email.hasError('required')) return 'Debes introducir un email';
    if (this.email.hasError('email')) return 'Introduce un email válido';
    return '';
  }

  /**
   * Devuelve el mensaje de error para la contraseña (si existe).
   * @returns string con el mensaje de error adecuado
   */
  getPasswordError(): string {
    if (this.password.hasError('required')) return 'Debes introducir una contraseña';
    if (this.password.hasError('minlength')) return 'La contraseña debe tener al menos 6 caracteres';
    return '';
  }

  /**
   * Envía el formulario de login.
   * - Valida el formulario.
   * - Llama al AuthService para autenticarse.
   * - Muestra notificaciones y gestiona el estado de carga.
   * @returns Promise<void>
   */
  async onSubmit(): Promise<void> {
    if (this.loginForm.invalid) return;

    this.loading = true;
    this.errorMessage = null;

    const { email, password, rememberMe } = this.loginForm.value;

    try {
      await this.authService.login(email, password);

      // Recuerda el email si el usuario lo pide
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }

      // Notificación de éxito y navegación
      this.snackBar.open('¡Login correcto! Redirigiendo...', '', {
        duration: 2000,
        panelClass: 'snack-success'
      });
      this.router.navigate(['/dashboard']);
    } catch (error: any) {
      this.errorMessage = 'Correo o contraseña incorrectos';
      this.snackBar.open(this.errorMessage, 'Cerrar', {
        duration: 4000,
        panelClass: 'snack-error'
      });
      console.error(error);
    } finally {
      this.loading = false;
    }
  }
}
