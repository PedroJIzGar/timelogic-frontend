// src/app/core/interceptors/auth.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { from, switchMap, catchError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { environment } from '../../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const api = environment.apiBaseUrl; // e.g. 'https://api.timelogic.com'

  // Solo adjunta Authorization a llamadas de tu API
  if (!req.url.startsWith(api)) {
    return next(req);
  }

  return from(auth.getValidToken()).pipe(
    switchMap(token => {
      const authReq = token
        ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
        : req;
      return next(authReq);
    }),
    // (opcional) si tu backend devuelve 401 cuando el token expiró
    catchError(err => {
      // aquí podrías desloguear o reintentar forzando refresh si lo necesitas
      return next(req); // o throwError(() => err)
    })
  );
};
