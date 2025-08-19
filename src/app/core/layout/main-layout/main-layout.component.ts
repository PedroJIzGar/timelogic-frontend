import { Component, HostListener, computed, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

// PrimeNG
import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MenuModule } from 'primeng/menu';
import { BadgeModule } from 'primeng/badge';
import { RippleModule } from 'primeng/ripple';
import { AvatarModule } from 'primeng/avatar';
import { TooltipModule } from 'primeng/tooltip';

// App
import { AuthService } from '../../services/auth.service';
import { AppMenuItem } from '../app-menu-item.model';

// RxJS
import { debounceTime, map, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    // PrimeNG
    ToolbarModule,
    ButtonModule,
    InputTextModule,
    MenuModule,
    BadgeModule,
    RippleModule,
    AvatarModule,
    TooltipModule,
    // Forms
    ReactiveFormsModule,
  ],
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss'],
})
export class MainLayoutComponent {
  // ──────────────────────────────────────────────────────────────────────────
  // DEPENDENCIAS
  // ──────────────────────────────────────────────────────────────────────────
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  // ──────────────────────────────────────────────────────────────────────────
  // ESTADO DE AUTENTICACIÓN (señales)
  // ──────────────────────────────────────────────────────────────────────────
  /** Señal que indica si auth ya se inicializó (útil para mostrar/ocultar layout). */
  readonly authReady = toSignal(this.auth.authReady$, { initialValue: false });

  /** Señal con el token JWT actual (o `null` si no autenticado). */
  readonly token = toSignal(this.auth.token$, { initialValue: null });

  /** Señal derivada: `true` si hay sesión válida. */
  readonly isAuthed = computed(() => !!this.token());

  // ──────────────────────────────────────────────────────────────────────────
  // LAYOUT: SIDEBAR Y RESPONSIVE
  // ──────────────────────────────────────────────────────────────────────────
  /** `true` si el sidebar está colapsado (modo mini con solo iconos). */
  isCollapsed = false;

  /** `true` si el viewport es pequeño (<= 768px). */
  isSmall = window.innerWidth <= 768;

  /** Icono del botón de toggle según estado del sidebar. */
  get toggleIcon(): string {
    return this.isCollapsed ? 'pi pi-angle-right' : 'pi pi-angle-left';
  }

  /** Alterna el estado colapsado del sidebar. */
  toggleSidebar(): void {
    this.isCollapsed = !this.isCollapsed;
  }

  /** Recalcula `isSmall` al redimensionar y, si quieres, fuerza el colapsado en móvil. */
  @HostListener('window:resize')
  onResize(): void {
    this.isSmall = window.innerWidth <= 768;
    if (this.isSmall) this.isCollapsed = true; // opcional
  }

  // ──────────────────────────────────────────────────────────────────────────
  // MENÚ LATERAL + BÚSQUEDA
  // ──────────────────────────────────────────────────────────────────────────
  /**
   * Modelo base del menú (grupos + items).
   * Nota: `badge` en PrimeNG es `string`, por eso convertimos números con `String(...)`.
   */
  readonly items: AppMenuItem[] = [
    {
      label: 'General',
      items: [
        {
          label: 'Dashboard',
          icon: 'pi pi-home',
          routerLink: '/dashboard',
          badge: String(3),
        },
        { label: 'Empleados', icon: 'pi pi-users', routerLink: '/employees' },
        { label: 'Turnos', icon: 'pi pi-calendar', routerLink: '/shifts' },
      ],
    },
    {
      label: 'Soporte',
      items: [
        {
          label: 'Incidencias',
          icon: 'pi pi-exclamation-circle',
          routerLink: '/issues',
          badge: '12',
        },
        { label: 'Ajustes', icon: 'pi pi-cog', routerLink: '/settings' },
      ],
    },
  ];

  /**
   * Control del campo de búsqueda en la toolbar.
   * - Usa `nonNullable` para evitar `null` en el valor.
   */
  readonly searchCtrl = new FormControl<string>('', { nonNullable: true });

  /**
   * Señal con la query normalizada (trim + lowercase) y *debounce* (150 ms).
   */
  readonly query = toSignal(
    this.searchCtrl.valueChanges.pipe(
      startWith(this.searchCtrl.value),
      debounceTime(150),
      map((q) => (q ?? '').trim().toLowerCase())
    ),
    { initialValue: '' }
  );

  /**
   * Items filtrados del menú según `query`.
   * - Mantiene los grupos originales y elimina los que queden vacíos.
   * - Filtra por `label`, `icon` o `routerLink`.
   */
  readonly filteredItems = computed<AppMenuItem[]>(() => {
    const q = this.query().trim();
    if (!q) return this.items;

    return this.items.reduce<AppMenuItem[]>((acc, group) => {
      const children = group.items ?? [];
      const filtered = children.filter(
        (it) =>
          (it.label ?? '').toLowerCase().includes(q) ||
          (typeof it.routerLink === 'string' ? it.routerLink : '')
            .toLowerCase()
            .includes(q) ||
          (it.icon ?? '').toLowerCase().includes(q)
      );
      if (filtered.length) {
        acc.push({ ...group, items: filtered } as AppMenuItem);
      }
      return acc;
    }, []);
  });

  /** Limpia el cuadro de búsqueda. */
  clearSearch(): void {
    this.searchCtrl.setValue('');
  }

  // ──────────────────────────────────────────────────────────────────────────
  // ACCIONES
  // ──────────────────────────────────────────────────────────────────────────
  /**
   * Cierra sesión y redirige al login.
   * @returns Promesa resuelta cuando se completa la navegación.
   */
  async logout(): Promise<void> {
    await this.auth.logout();
    await this.router.navigate(['/auth/login'], { replaceUrl: true });
  }
}
