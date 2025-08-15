import { CanMatchFn, Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { MainLayoutComponent } from './core/layout/main-layout/main-layout.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { EmployeesComponent } from './features/employees/employees.component';
import { ScheduleComponent } from './features/schedule/schedule.component';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';

export const routes: Routes = [
  {
    path: 'auth',
    canActivateChild: [guestGuard],
    children: [
      {
        path: 'login',
        loadComponent: () => import('./features/auth/login/login.component')
          .then(c => c.LoginComponent),
        title: 'Iniciar sesión',
      },
      {
        path: 'register',
        loadComponent: () => import('./features/auth/register/register.component')
          .then(c => c.RegisterComponent),
        title: 'Crear cuenta',
      },
      {
        path: 'forgot-password',
        loadComponent: () => import('./features/auth/forgot-password/forgot-password.component')
          .then(c => c.ForgotPasswordComponent),
        title: 'Recuperar contraseña',
      },
    ],
  },

  {
    path: '',
    // ⬇️ usa canActivate en vez de canMatch
    canActivate: [authGuard],
    loadComponent: () =>
      import('./core/layout/main-layout/main-layout.component')
        .then(c => c.MainLayoutComponent),
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component')
          .then(c => c.DashboardComponent),
        title: 'Dashboard',
      },
      {
        path: 'employees',
        loadComponent: () => import('./features/employees/employees.component')
          .then(c => c.EmployeesComponent),
        title: 'Empleados',
      },
      {
        path: 'schedule',
        loadComponent: () => import('./features/schedule/schedule.component')
          .then(c => c.ScheduleComponent),
        title: 'Planificación',
      },
    ],
  },

  {
    path: 'auth/verify-email',
    canActivate: [authGuard], // necesita sesión para reenviar
    loadComponent: () =>
      import('./features/auth/verify-email/verify-email.component')
        .then(c => c.VerifyEmailComponent),
    title: 'Verifica tu correo',
  },

  {
    path: 'unauthorized',
    loadComponent: () => import('./features/system/unauthorize/unauthorize.component')
      .then(c => c.UnauthorizeComponent),
    title: 'No autorizado',
  },

  {
    path: 'not-found',
    loadComponent: () => import('./features/system/not-found/not-found.component')
      .then(c => c.NotFoundComponent),
    title: 'No encontrado',
  },

  { path: '**', redirectTo: 'not-found' }, // siempre al final
];
