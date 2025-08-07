import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

/**
 * Componente para la creación de una nueva cuenta de usuario.
 * Permite el registro a través de email y contraseña, validando
 * en tiempo real los campos e informando sobre la fortaleza de la contraseña.
 * Si ocurre un error con Firebase, muestra un mensaje claro al usuario.
 *
 * @author TuNombre
 */
@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    RouterModule
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  /** Controla si la contraseña está oculta en el input principal */
  hidePassword = true;
  /** Controla si la repetición de contraseña está oculta */
  hideRepeatPassword = true;
  /** Formulario reactivo de registro */
  registerForm: FormGroup;
  /** Estado de carga al enviar formulario */
  loading = false;

  /**
   * Inyección de dependencias y definición del formulario reactivo.
   */
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      repeatPassword: ['', Validators.required]
    }, { validators: this.passwordsMatchValidator });
  }

  /**
   * Validador personalizado para comprobar si las contraseñas coinciden.
   * @param group FormGroup que contiene los campos password y repeatPassword
   * @returns ValidationErrors|null
   */
  private passwordsMatchValidator(group: AbstractControl): ValidationErrors | null {
    const pwd = group.get('password')?.value;
    const rpt = group.get('repeatPassword')?.value;
    return pwd === rpt ? null : { notMatching: true };
  }

  /** Getter para el campo nombre */
  get name() { return this.registerForm.get('name')!; }
  /** Getter para el campo email */
  get email() { return this.registerForm.get('email')!; }
  /** Getter para el campo contraseña */
  get password() { return this.registerForm.get('password')!; }
  /** Getter para el campo repetir contraseña */
  get repeatPassword() { return this.registerForm.get('repeatPassword')!; }

  /**
   * Calcula y retorna la fortaleza de la contraseña actual.
   * @returns 'Débil' | 'Media' | 'Fuerte' | ''
   */
  get passwordStrength(): 'Débil' | 'Media' | 'Fuerte' | '' {
    const pwd = this.password.value || '';
    if (!pwd) return '';
    if (pwd.length < 6) return 'Débil';
    if (/[A-Z]/.test(pwd) && /[0-9]/.test(pwd) && /[^A-Za-z0-9]/.test(pwd) && pwd.length >= 8) return 'Fuerte';
    if (pwd.length >= 6) return 'Media';
    return 'Débil';
  }

  /** Mensaje de error personalizado para nombre */
  getNameError(): string {
    if (this.name.hasError('required')) return 'El nombre es obligatorio.';
    if (this.name.hasError('minlength')) return 'Mínimo 2 caracteres.';
    return '';
  }
  /** Mensaje de error personalizado para email */
  getEmailError(): string {
    if (this.email.hasError('required')) return 'El correo es obligatorio.';
    if (this.email.hasError('email')) return 'Correo no válido.';
    return '';
  }
  /** Mensaje de error personalizado para contraseña */
  getPasswordError(): string {
    if (this.password.hasError('required')) return 'La contraseña es obligatoria.';
    if (this.password.hasError('minlength')) return 'Mínimo 6 caracteres.';
    return '';
  }
  /** Mensaje de error para repetir contraseña o no coincidencia */
  getRepeatPasswordError(): string {
    if (this.repeatPassword.hasError('required')) return 'Repite la contraseña.';
    if (this.registerForm.hasError('notMatching')) return 'Las contraseñas no coinciden.';
    return '';
  }

  /**
   * Envía el formulario y registra el usuario en Firebase Authentication.
   * Si hay error, lo traduce a un mensaje amigable y lo muestra en un snackbar.
   */
  async onSubmit(): Promise<void> {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }
    this.loading = true;
    const { name, email, password } = this.registerForm.value;
    try {
      await this.authService.register(email, password);
      this.snackBar.open('¡Registro correcto! Ya puedes iniciar sesión.', '', {
        duration: 2500, panelClass: 'snack-success'
      });
      this.router.navigate(['/auth/login']);
    } catch (error: any) {
      let message = 'Error desconocido. Intenta de nuevo.';
      // Traducción de errores típicos de Firebase
      if (error.code === 'auth/email-already-in-use') {
        message = 'Este correo ya está registrado.';
      } else if (error.code === 'auth/weak-password') {
        message = 'La contraseña es demasiado débil.';
      } else if (error.code === 'auth/invalid-email') {
        message = 'El correo no es válido.';
      }
      this.snackBar.open(message, 'Cerrar', {
        duration: 4000, panelClass: 'snack-error'
      });
    } finally {
      this.loading = false;
    }
  }
}
