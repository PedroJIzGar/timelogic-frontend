# TimeLogic — Frontend

Gestión de tiempo y equipos. Frontend en **Angular** con **PrimeNG** y autenticación con **Firebase Auth**. Arquitectura por *features*, componentes standalone y estilos SCSS compartidos.

> Estado actual: migración de **Auth** a PrimeNG completada (Login, Register y Forgot Password), estilos unificados y mejoras fuertes en accesibilidad.

---

## 🧭 Tabla de contenido
- [Stack](#-stack)
- [Características](#-características)
- [Capturas](#-capturas)
- [Requisitos](#-requisitos)
- [Arranque rápido](#-arranque-rápido)
- [Configuración](#-configuración)
- [Scripts](#-scripts)
- [Arquitectura & rutas](#-arquitectura--rutas)
- [Estructura del proyecto](#-estructura-del-proyecto)
- [Accesibilidad](#-accesibilidad)
- [Convenciones](#-convenciones)
- [Roadmap](#-roadmap)
- [PRs / Estado](#-prs--estado)
- [Licencia](#-licencia)

---

## 🧰 Stack
- **Angular v17** (standalone)
- **PrimeNG v17** + **PrimeIcons**
- **Firebase Auth** (email/password)
- **SCSS** con parciales (`styles/partials/_auth.scss`)
- Guards/Interceptors con **HttpClient** standalone

---

## ✅ Características

**Autenticación**
- Login y Registro con formularios reactivos.
- **Forgot Password** (restablecimiento por email).
- “Recuérdame” con persistencia de sesión.
- Gestión de token con listener `onIdTokenChanged` y helper `getValidToken()`.

**Rutas protegidas**
- `authGuard` (zonas privadas) y `guestGuard` (auth pública).
- Redirección `'' → /dashboard`, títulos de página y 404.
- (Opcional) `roleGuard` preparado para custom claims.

**UI/UX**
- Patrón de campo con **icono + separador + label flotante**.
- Botones con estado de **loading**, formularios con `aria-busy`.
- Toasts (PrimeNG `MessageService`) para feedback de éxito/error.
- Inputs con **fondo blanco** y placeholders oscuros (override del “filled mode”).

**Accesibilidad**
- `id/for`, `aria-invalid`, `aria-describedby` en campos.
- **Live region** para anunciar errores globales.
- Enfoque automático al **primer campo inválido** tras submit fallido.

---

## 📸 Capturas
> Añade imágenes reales (por ejemplo en `docs/`) y actualiza los paths:
- Login — `docs/login.png`  
- Registro — `docs/register.png`  
- Recuperar contraseña — `docs/forgot.png`

---

## 🧱 Requisitos
- Node **18+** (LTS recomendado).
- Angular CLI (opcional): `npm i -g @angular/cli@17`.

---

## 🚀 Arranque rápido

```bash
# 1) Clonar
git clone https://github.com/PedroJIzGar/timelogic-frontend.git
cd timelogic-frontend

# 2) Instalar dependencias
npm ci

# 3) Levantar en dev
npm start   # abre http://localhost:4200

## ⚙️ Configuración

### Estilos globales (PrimeNG)
En `src/styles.scss`:

    @import 'primeng/resources/themes/lara-light-blue/theme.css';
    @import 'primeng/resources/primeng.min.css';
    @import 'primeicons/primeicons.css';

### Parcial de estilos compartidos (auth)
`src/styles/partials/_auth.scss` expone `@mixin auth-page()` para login/register/forgot.  
En cada componente de auth:

    @use '../../../../styles/partials/auth' as auth;
    @include auth.auth-page();

### Firebase
Activa **Email/Password** en Firebase Auth y añade credenciales en `src/environments/environment.ts`:

    export const environment = {
      production: false,
      firebase: {
        apiKey: '…',
        authDomain: '…',
        projectId: '…',
        appId: '…',
      },
      // apiBaseUrl: '' // cuando tengas backend
    };

### Animaciones
Usa `provideAnimations()` en el bootstrap (necesario para overlays de PrimeNG como `p-password`).

    // Ejemplo (main.ts o app.config.ts)
    import { provideAnimations } from '@angular/platform-browser/animations';
    // ...añadir provideAnimations() en providers


## 🧪 Scripts

    npm start         # ng serve
    npm run build     # build producción
    npm run test      # (cuando haya tests)
    npm run lint      # (si se añade eslint)


## 🏗 Arquitectura & rutas

Auth pública (`guestGuard`)
- `/auth/login`
- `/auth/register`
- `/auth/forgot-password`

App privada (`authGuard`)
- `/dashboard`
- `/employees`
- `/schedule`

Redirect & 404
- `''` → `/dashboard`
- `**` → `''`

Notas
- Enlaces absolutos en plantilla (p. ej. `routerLink="/auth/forgot-password"`); evita relativos desde `/auth/login`.


## 🗂 Estructura del proyecto

    src/
      app/
        core/
          guards/
            auth.guard.ts
            guest.guard.ts
            role.guard.ts
          interceptors/
            auth.interceptor.ts
          services/
            auth.service.ts
          layout/
            main-layout/...
        features/
          auth/
            login/
              login.component.{ts,html,scss}
            register/
              register.component.{ts,html,scss}
            forgot-password/
              forgot-password.component.{ts,html,scss}
          dashboard/...
          employees/...
          schedule/...
      styles/
        partials/
          _auth.scss


## ♿ Accesibilidad

- Campos con `id/for`, `aria-invalid` y `aria-describedby`.
- Live region `aria-live="assertive"` para errores globales.
- `aria-busy` y bloqueo visual durante el submit.
- Enfoque en el **primer control inválido**.

Checklist QA (resumen)
- [ ] Validación email/password y mensajes por campo.
- [ ] Error global anunciado por SR (live region).
- [ ] “Recordarme” guarda/borra email en localStorage.
- [ ] Password y email con el mismo ancho visual.
- [ ] Overlays sin clipping (`appendTo="body"`).
- [ ] Navegación a `/dashboard` tras login; guards activos.


## ✍️ Convenciones

- Commits: **Conventional Commits** (`feat:`, `fix:`, `chore:`…).
- Ramas: `feat/...`, `fix/...`, `chore/...`.
- PRs: descripción con checklist de QA y, si es posible, capturas.


## 🗺️ Roadmap

- Backend/API + **cookies HttpOnly** (eliminar `Authorization` del cliente).
- Perfil de usuario (guardar nombre en backend tras login).
- Roles con **custom claims** y `roleGuard`.
- Theming (dark mode) e **i18n**.
- Tests unitarios (AuthService/guards) y **e2e** de Auth.


## 🔗 PRs / Estado

- PR de autenticación y migración a PrimeNG:  
  https://github.com/PedroJIzGar/timelogic-frontend/pull/1


## 📄 Licencia

© TimeLogic. Todos los derechos reservados.

