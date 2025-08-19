import {
  ChangeDetectionStrategy,
  Component,
  Input,
  computed,
  signal,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';

/**
 * @fileoverview ScheduleOverviewComponent
 * @description
 * Componente de presentación para mostrar el **Horario de hoy** en una tabla accesible.
 * - Resalta el turno actual automáticamente.
 * - Calcula el estado dinámicamente a partir de `start` y `end`.
 * - Optimizado con `OnPush` y ordenación por hora de inicio.
 *
 * Accesibilidad:
 * - Tabla con `<caption>` descriptivo (en plantilla).
 * - `th scope="col"` en cabecera y `th scope="row"` para el empleado.
 * - La fila activa usa `aria-current="true"`.
 * - El chip de estado tiene `aria-label` descriptivo.
 *
 * UX:
 * - Fila activa con fondo suave y hora resaltada.
 * - Actualización automática cada minuto para reflejar cambios de estado en vivo.
 */

/**
 * Entrada de horario.
 * `start` y `end` se expresan como cadenas "HH:mm" en formato 24h.
 * `time` se admite por compatibilidad y se interpreta como `start`.
 */
export interface ScheduleEntry {
  /** Hora de inicio en formato "HH:mm" (24h). */
  start?: string;
  /** Hora de salida en formato "HH:mm" (24h). */
  end?: string;
  /** Compatibilidad: se trata como `start`. */
  time?: string;

  /** Nombre del empleado. */
  employee: string;
  /** Rol o puesto. */
  role: string;
}

/**
 * Tabla de "Horario de hoy".
 *
 * @example
 * ```html
 * <app-schedule-overview [date]="today" [entries]="schedule"></app-schedule-overview>
 * ```
 *
 * ```ts
 * today = new Date();
 * schedule: ScheduleEntry[] = [
 *   { start: '08:00', end: '09:00', employee: 'Laura',  role: 'Recepción' },
 *   { start: '09:00', end: '10:00', employee: 'Carlos', role: 'Ventas'    },
 *   { start: '10:00', end: '11:00', employee: 'Nora',   role: 'Soporte'   },
 *   { start: '11:00', end: '12:00', employee: 'Iván',   role: 'Almacén'   },
 * ];
 * ```
 */
@Component({
  selector: 'app-schedule-overview',
  standalone: true,
  imports: [CommonModule, CardModule, TableModule, TagModule],
  templateUrl: './schedule-overview.component.html',
  styleUrls: ['./schedule-overview.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScheduleOverviewComponent implements OnInit, OnDestroy {
  /** Fecha actual mostrada en la cabecera */
  @Input({ required: true }) date!: Date;

  /** Lista de entradas de horario */
  @Input() set entries(value: ScheduleEntry[]) {
    const norm = (value ?? []).map((e) => this.normalize(e));
    this._entries.set(this.sortByStatus(norm));
  }

  /** Señal interna con los horarios normalizados y ordenados */
  private _entries = signal<(ScheduleEntry & { start: string })[]>([]);
  /** Computed con la lista ordenada lista para renderizado */
  readonly entriesSorted = computed(() => this._entries());

  private _timer: any;

  constructor(private readonly cdr: ChangeDetectorRef) {}

  /**
   * Inicializa un temporizador que fuerza la detección de cambios
   * al inicio de cada minuto → garantiza que el estado ("En turno", etc.)
   * esté siempre actualizado.
   */
  ngOnInit(): void {
    const msToNextMinute = (60 - new Date().getSeconds()) * 1000 + 50;
    setTimeout(() => {
      this.cdr.markForCheck();
      this._timer = setInterval(() => this.cdr.markForCheck(), 60_000);
    }, msToNextMinute);
  }

  /** Limpieza de intervalos */
  ngOnDestroy(): void {
    if (this._timer) clearInterval(this._timer);
  }

  /** Hora actual en formato HH:mm */
  private nowHHmm(): string {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, '0')}:${String(
      d.getMinutes()
    ).padStart(2, '0')}`;
  }

  /** Normaliza cada entrada asegurando siempre un campo `start`. */
  private normalize(e: ScheduleEntry): ScheduleEntry & { start: string } {
    const start = e.start ?? e.time ?? '00:00';
    return { ...e, start };
  }

  /**
   * Ordena las entradas por estado en el siguiente orden:
   * 1. En turno
   * 2. Próximo
   * 3. Finalizado
   * Si comparten estado, se ordenan por hora de inicio.
   */
  private sortByStatus(list: (ScheduleEntry & { start: string })[]) {
    const statusOrder = { on: 0, upcoming: 1, done: 2 };
    return list.sort((a, b) => {
      const sa = this.getStatus(a);
      const sb = this.getStatus(b);
      if (statusOrder[sa] !== statusOrder[sb]) {
        return statusOrder[sa] - statusOrder[sb];
      }
      return a.start.localeCompare(b.start);
    });
  }

  /**
   * Determina el estado de un turno en función de la hora actual.
   * @returns 'done' → turno terminado | 'on' → en turno | 'upcoming' → próximo
   */
  getStatus(row: ScheduleEntry): 'done' | 'on' | 'upcoming' {
    const now = this.nowHHmm();
    const start = row.start ?? row.time ?? '';
    const end = row.end;

    if (end && now >= end) return 'done';
    if (start && (!end ? now === start : start <= now && now < end))
      return 'on';
    return 'upcoming';
  }

  /** Texto visible de un estado */
  statusLabel(s: 'done' | 'on' | 'upcoming'): string {
    switch (s) {
      case 'done':
        return 'Finalizado';
      case 'on':
        return 'En turno';
      case 'upcoming':
        return 'Próximo';
    }
  }

  /** Severidad visual del estado (para PrimeNG Tag) */
  statusSeverity(s: 'done' | 'on' | 'upcoming') {
    switch (s) {
      case 'on':
        return 'success';
      case 'done':
        return 'secondary';
      case 'upcoming':
        return 'info';
    }
  }
}
