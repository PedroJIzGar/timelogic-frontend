// src/app/core/guards/auth.guard.ts
import { inject } from '@angular/core';
import { CanMatchFn, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { firstValueFrom } from 'rxjs';

export const authGuard: CanMatchFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  // Espera a la restauración de sesión de Firebase
  await firstValueFrom(auth.authReady$);

  const token = await auth.getValidToken();
  return token ? true : router.createUrlTree(['/auth/login']);
};
