// src/app/core/guards/auth.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { firstValueFrom } from 'rxjs';

export const authGuard: CanActivateFn = async (route, state): Promise<boolean | UrlTree> => {
  const auth = inject(AuthService);
  const router = inject(Router);

  // Espera a la restauración de sesión de Firebase
  if ((auth as any).authReady$) {
    await firstValueFrom((auth as any).authReady$);
  }

  const token = await auth.getValidToken?.() ?? auth.getToken();
  if (token) return true;

  // Redirige a login con returnUrl
  return router.createUrlTree(['/auth/login'], { queryParams: { returnUrl: state.url } });
};
