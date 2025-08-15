// src/app/core/guards/role.guard.ts
import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { firstValueFrom } from 'rxjs';

export function roleGuard(allowedRoles: string[]): CanMatchFn {
  return async () => {
    const auth = inject(AuthService);
    const router = inject(Router);
    await firstValueFrom(auth.authReady$);

    const role = await auth.getUserRole(); // desde custom claims
    if (role && allowedRoles.includes(role)) return true;

    return router.createUrlTree(['/unauthorized']);
  };
}
