## Descripción

Migración/feature de autenticación y mejoras UX/a11y.

### Cambios

- [ ] Servicio de auth endurecido (token refresh, remember, helpers)
- [ ] Guards (auth/guest/emailVerified) y rutas con títulos/redirecciones
- [ ] Pantallas Auth (login/register/forgot/verify-email) con PrimeNG
- [ ] A11y: aria, live regions, focus, aria-busy
- [ ] CI de build en PR

## Cómo probar

1. Login correcto redirige a /dashboard o a ?returnUrl
2. Validaciones de formularios y errores visibles
3. Forgot Password manda correo (mensaje genérico)
4. (Opcional) Email verificación: reenviar correo en pantalla dedicada

## Checklist

- [ ] Sin warnings/errores en consola
- [ ] Build de CI verde
- [ ] Capturas adjuntas (si aplica)
