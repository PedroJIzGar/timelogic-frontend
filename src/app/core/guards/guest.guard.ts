// src/app/core/guards/guest.guard.ts
import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { firstValueFrom } from 'rxjs';

export const guestGuard: CanMatchFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  await firstValueFrom(auth.authReady$);
  const token = await auth.getValidToken();
  return token ? router.createUrlTree(['/dashboard']) : true;
};
