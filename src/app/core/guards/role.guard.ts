import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export function roleGuard(allowedRoles: string[]): CanActivateFn {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    const userRole = authService.getUserRole();

    if (!userRole || !allowedRoles.includes(userRole)) {
      router.navigate(['/unauthorized']); // o redirige donde tú quieras
      return false;
    }

    return true;
  };
}
