import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const guestGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.getToken();

  if (token) {
    router.navigate(['/dashboard']); // Redirige a dashboard si ya está logueado
    return false;
  } else {
    return true; // Permite el acceso a login/register si NO hay token
  }
};
