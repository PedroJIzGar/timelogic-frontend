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
- **Angular** (standalone)
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
- Angular CLI (opcional): `npm i -g @angular/cli`.

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
