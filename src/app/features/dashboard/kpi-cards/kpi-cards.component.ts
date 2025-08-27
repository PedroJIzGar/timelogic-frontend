import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProgressBarModule } from 'primeng/progressbar';
import { TagModule } from 'primeng/tag';
import { CardModule } from 'primeng/card';

/**
 * @fileoverview KpiCardsComponent
 * @description
 * Componente de presentación para mostrar indicadores clave (KPIs) del dashboard:
 * - Vacaciones (personas/horas)
 * - Horas gastadas (hoy/semana)
 * - Tareas del día
 * - Peticiones
 * - Incidencias
 *
 * ## Accesibilidad (A11y)
 * - Cada KPI se renderiza como `article` con `header` y `h4` (en la plantilla).
 * - La sección tiene `aria-labelledby` con título para lectores de pantalla.
 * - Las barras de progreso usan `role="progressbar"` + `aria-valuenow/min/max` + texto oculto (.sr-only).
 * - Los iconos tienen `aria-hidden="true"` para no "ensuciar" el árbol accesible.
 * - Cada tile admite foco de teclado (`tabindex="0"`) y estilo de `:focus-visible`.
 *
 * ## Rendimiento
 * - `ChangeDetectionStrategy.OnPush` para minimizar renderizados.
 *
 * ## Uso (ejemplo)
 * ```html
 * <p-card header="KPIs">
 *   <app-kpi-cards [items]="kpis"></app-kpi-cards>
 * </p-card>
 * ```
 * ```ts
 * kpis = [
 *   { key: 'vacaciones', label: 'Vacaciones', icon: 'pi pi-sun',
 *     main: { label: 'Personas', value: 3, unit: 'pers', target: 10 },
 *     secondary: { label: 'Horas', value: 24, unit: 'h', target: 80 }, trend: 'up' },
 *   { key: 'horas', label: 'Horas gastadas', icon: 'pi pi-clock',
 *     main: { label: 'Hoy', value: 6, unit: 'h', target: 8 },
 *     secondary: { label: 'Semana', value: 28, unit: 'h', target: 40 } },
 *   { key: 'tareas', label: 'Tareas del día', icon: 'pi pi-list-check', main: { value: 9, target: 12 }, trend: 'up' },
 *   { key: 'peticiones', label: 'Peticiones', icon: 'pi pi-inbox', main: { value: 4 }, trend: 'flat' },
 *   { key: 'incidencias', label: 'Incidencias', icon: 'pi pi-exclamation-triangle', main: { value: 1 }, trend: 'down' },
 * ];
 * ```
 */

/**
 * Claves permitidas para identificar un KPI concreto.
 * @typedef {'vacaciones' | 'horas' | 'tareas' | 'peticiones' | 'incidencias'} KpiKey
 */
export type KpiKey =
  | 'vacaciones'
  | 'horas'
  | 'tareas'
  | 'peticiones'
  | 'incidencias';

/**
 * Estructura de una métrica de KPI (principal o secundaria).
 * @public
 */
export interface KpiMetric {
  /** Subtítulo opcional de la métrica (p. ej., "Hoy", "Semana", "Personas"). */
  label?: string;
  /** Valor numérico de la métrica. */
  value: number;
  /** Unidad opcional (p. ej., "h", "pers", "%", "€"). */
  unit?: string;
  /**
   * Objetivo opcional. Si se define, se renderiza barra de progreso.
   * `progress = clamp(round(value / target * 100), 0..100)`
   */
  target?: number;
}

/**
 * Modelo de un KPI (tile).
 * @public
 */
export interface KpiItem {
  /** Identificador único y semántico del KPI. */
  key: KpiKey;
  /** Título visible del KPI. */
  label: string;
  /** Clase de icono PrimeIcons (p. ej., "pi pi-sun"). */
  icon?: string;
  /** Tendencia opcional para mostrar un "tag" de estado. */
  trend?: 'up' | 'down' | 'flat';
  /** Métrica principal (obligatoria). */
  main: KpiMetric;
  /** Métrica secundaria (opcional). */
  secondary?: KpiMetric;
}

/**
 * Componente de tarjetas de KPIs.
 * - Renderiza hasta 5 tiles: vacaciones, horas, tareas, peticiones e incidencias.
 * - La disposición y estilos se definen en el HTML/SCSS asociados (grid por áreas).
 *
 * @component
 * @public
 */
@Component({
  selector: 'app-kpi-cards',
  standalone: true,
  imports: [CommonModule, CardModule, ProgressBarModule, TagModule],
  templateUrl: './kpi-cards.component.html',
  styleUrls: ['./kpi-cards.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KpiCardsComponent {
  /**
   * Lista de KPIs a mostrar.
   * @input
   * @remarks
   * - El componente buscará por `key` cada tile conocido.
   * - Si falta alguna `key`, el tile simplemente no se renderiza.
   */
  @Input() items: KpiItem[] = [];

  /**
   * Busca un KPI por su `key`.
   * @param key {KpiKey} Clave del KPI a recuperar.
   * @returns {KpiItem | undefined} El KPI si existe en `items`; si no, `undefined`.
   */
  getBy(key: KpiKey): KpiItem | undefined {
    return this.items.find((i) => i.key === key);
  }

  /**
   * Calcula el porcentaje de progreso a partir de una métrica con objetivo.
   * @param m {KpiMetric | undefined} Métrica con `value` y `target`.
   * @returns {number} Porcentaje entero en el rango [0..100]. Devuelve 0 si no hay `target` o es 0.
   */
  progress(m?: KpiMetric): number {
    if (!m?.target || m.target === 0) return 0;
    const pct = Math.round((m.value / m.target) * 100);
    return Math.max(0, Math.min(100, pct));
  }

  /**
   * Texto legible de la tendencia para su uso visual y accesible.
   * @param t {'up'|'down'|'flat'|undefined} Tendencia.
   * @returns {'Sube'|'Baja'|'Estable'} Etiqueta textual.
   */
  trendText(t?: KpiItem['trend']): 'Sube' | 'Baja' | 'Estable' {
    if (t === 'up') return 'Sube';
    if (t === 'down') return 'Baja';
    return 'Estable';
  }

  /**
   * Severidad de PrimeNG asociada a la tendencia.
   * @param t {'up'|'down'|'flat'|undefined} Tendencia.
   * @returns {'success'|'danger'|'info'} Severidad para `<p-tag>`.
   */
  trendSeverity(t?: KpiItem['trend']): 'success' | 'danger' | 'info' {
    if (t === 'up') return 'success';
    if (t === 'down') return 'danger';
    return 'info';
  }

  /**
   * Genera IDs estables para vincular nombres y descripciones en ARIA.
   * @param key {KpiKey} Clave del KPI (p. ej., 'vacaciones').
   * @param part {string} Parte del elemento (p. ej., 'title' | 'main-label' | 'sec-label').
   * @returns {string} ID único y estable para usar en `aria-labelledby` / `aria-describedby`.
   *
   * @example
   * id('vacaciones','title') => 'kpi-vacaciones-title'
   */
  id(key: KpiKey, part: string): string {
    return `kpi-${key}-${part}`;
  }
}
