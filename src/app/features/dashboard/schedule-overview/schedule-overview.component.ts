import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
  computed,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { CardModule } from 'primeng/card';
import { TableModule, TablePageEvent } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { OverlayPanel, OverlayPanelModule } from 'primeng/overlaypanel';

/** Vista disponible para el horario. */
export type ViewMode = 'day' | 'week';

/** Sistema de semana: ISO (lunes) o US (domingo). */
export type WeekSystem = 'iso' | 'us';

/** Entrada de planificación (turno). */
export interface ScheduleEntry {
  /** Fecha en formato ISO: YYYY-MM-DD. Si falta, se asume la fecha activa. */
  date?: string;
  /** Hora de inicio HH:mm. */
  start?: string;
  /** Hora de fin HH:mm. */
  end?: string;
  /** Alias de 'start'. */
  time?: string;
  /** Nombre de empleado. */
  employee: string;
  /** Rol/área. */
  role: string;
}

/**
 * Componente de resumen de horarios (vista Día / Semana).
 *
 * Características:
 * - Selector de fechas como **popover** (PrimeNG `OverlayPanel`) anclado a un botón del header.
 * - En vista **Semana**, al seleccionar un día se normaliza automáticamente al rango
 *   `[inicioDeSemana, finDeSemana]` según `weekSystem`.
 * - En vista **Día**, se selecciona una única fecha.
 * - **Toggle Semana/Día** también en el header (fuera del popover) que cambia la vista global.
 * - Paginación y ordenación reactiva via **Signals**.
 */
@Component({
  selector: 'app-schedule-overview',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    TableModule,
    TagModule,
    ButtonModule,
    CalendarModule,
    OverlayPanelModule,
  ],
  templateUrl: './schedule-overview.component.html',
  styleUrls: ['./schedule-overview.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScheduleOverviewComponent implements OnInit, OnDestroy {
  // ─────────────────────────────────── Inputs ───────────────────────────────────

  private _inputDate!: Date;

  /**
   * Fecha de referencia inicial (día activo).
   * Al cambiar, resetea la paginación de Día y Semana.
   */
  @Input({ required: true })
  set date(v: Date) {
    this._inputDate = v;
    this.currentDate.set(v);
    this.resetDayPager();
    this.resetWeekPager();
  }
  get date(): Date {
    return this._inputDate;
  }

  // ─────────────────────────── Popover (filtro) ───────────────────────────

  /** Ref. al `OverlayPanel` del popover (defínelo en la plantilla con `#filterPanel`). */
  @ViewChild('filterPanel') filterPanel!: OverlayPanel;

  /** Estado para aria-expanded del botón. (Se actualiza en onShow/onHide del overlay). */
  filterOpen = false;

  /**
   * Modelo del calendario del popover:
   * - En "day": selectionMode="single"  → Date
   * - En "week": selectionMode="range"  → Date[]
   */
  rangeTmp: Date | Date[] | null = null;

  /** Modo de vista seleccionado dentro del popover (independiente del aplicado). */
  viewModeTmp: ViewMode = 'week';

  /**
   * Fecha inicial actualmente seleccionada en el popover.
   * @returns Fecha "desde" o null si aún no hay selección válida.
   */
  get rangeStart(): Date | null {
    const v = this.rangeTmp;
    if (!v) return null;
    if (v instanceof Date) return v;
    return Array.isArray(v) && v[0] instanceof Date ? v[0] : null;
  }

  /**
   * Fecha final actualmente seleccionada en el popover.
   * @returns Fecha "hasta" o null si aún no hay selección válida.
   */
  get rangeEnd(): Date | null {
    const v = this.rangeTmp;
    if (!v) return null;
    if (v instanceof Date) return v; // en "day": fin = inicio
    return Array.isArray(v) && v[1] instanceof Date ? v[1] : null;
  }

  /**
   * Texto legible para el chip de fecha del encabezado.
   * - En "week": muestra [inicio de semana – fin de semana] según `weekSystem`.
   * - En "day": muestra la fecha activa.
   */
  public get rangeLabel(): string {
    const opts: Intl.DateTimeFormatOptions = {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    };
    const fmt = new Intl.DateTimeFormat('es-ES', opts);

    if (this.viewMode() === 'week') {
      return `${fmt.format(this.wkStartDate())} – ${fmt.format(
        this.wkEndDate()
      )}`;
    }
    return fmt.format(this.currentDate());
  }

  /**
   * Prepara el **modelo del calendario** del popover en función de la vista actual.
   * - Semana → `[inicioSemana, finSemana]`
   * - Día    → `Date` simple
   */
  private prepareFilterModel(): void {
    this.viewModeTmp = this.viewMode();
    if (this.viewModeTmp === 'week') {
      const s = this.wkStartDate();
      const e = this.wkEndDate();
      this.rangeTmp = [new Date(s), new Date(e)];
    } else {
      this.rangeTmp = new Date(this.currentDate());
    }
  }

  /**
   * Abre/cierra el **popover** anclándolo al botón que dispara el evento.
   * Prepara previamente el modelo del calendario.
   * @param ev Evento de click del botón (necesario para posicionar el panel).
   */
  public toggleFilter(ev: Event): void {
    this.prepareFilterModel();
    this.filterPanel?.toggle(ev);
  }

  /** Cierra el popover sin aplicar cambios. */
  public closeFilter(): void {
    this.filterPanel?.hide();
  }

  /**
   * Normaliza la selección del calendario del **popover**:
   * - En "week": con un clic sobre cualquier día, fija el rango completo
   *   de la semana [inicio, fin] según `weekSystem`.
   * - En "day": guarda un `Date` simple.
   *
   * Acepta tanto `onSelect($event)` (objeto con `value`) como `ngModelChange`.
   * @param raw Valor emitido por PrimeNG (`Date | Date[] | { value: ... }`).
   */
  public onCalendarChange(raw: unknown): void {
    // onSelect emite { value: ... }; ngModelChange emite directamente el value
    let value: unknown = raw as any;
    if (value && typeof value === 'object' && 'value' in (value as any)) {
      value = (value as any).value;
    }

    // Determina el día base de la selección
    let base: Date | null = null;
    if (value instanceof Date) base = value;
    else if (Array.isArray(value) && value[0] instanceof Date) base = value[0];

    if (!base) return;

    if (this.viewModeTmp === 'week') {
      const s = this.startOfWeek(base, this.weekSystem());
      const e = this.endOfWeek(s, this.weekSystem());
      this.rangeTmp = [new Date(s), new Date(e)];
    } else {
      this.rangeTmp = new Date(base);
    }

    this.cdr.markForCheck();
  }

  /**
   * Cambia la vista **dentro del popover** (Semana/Día) y adapta el modelo:
   * - A "week": convierte a `[inicioDeSemana, finDeSemana]`.
   * - A "day": colapsa a `Date` único (desde).
   * @param v Vista a activar dentro del popover.
   */
  public setView(v: ViewMode): void {
    this.viewModeTmp = v;
    const from = this.rangeStart ?? this.currentDate();

    if (v === 'week') {
      const s = this.startOfWeek(from, this.weekSystem());
      const e = this.endOfWeek(s, this.weekSystem());
      this.rangeTmp = [new Date(s), new Date(e)];
    } else {
      this.rangeTmp = new Date(from);
    }
    this.cdr.markForCheck();
  }

  /**
   * ✔ Cambia la **vista global** del componente (control del header).
   * - Actualiza `viewMode`.
   * - Si es "week", alinea `currentDate` al inicio de semana.
   * - Resetea la paginación correspondiente.
   * @param v Vista a activar (día/semana).
   */
  public setMode(v: ViewMode): void {
    if (v === this.viewMode()) return;
    this.viewMode.set(v);

    if (v === 'week') {
      this.currentDate.set(
        this.startOfWeek(this.currentDate(), this.weekSystem())
      );
      this.resetWeekPager();
    } else {
      this.resetDayPager();
    }
    this.cdr.markForCheck();
  }

  /**
   * Aplica la selección del popover:
   * - En "week": fija `currentDate` al **inicio** de la semana del día elegido y
   *   resetea la paginación de semana.
   * - En "day": fija `currentDate` al día elegido y resetea la paginación de día.
   * Cierra el popover al finalizar.
   */
  public applyFilter(): void {
    const from = this.rangeStart ?? this.currentDate();
    this.viewMode.set(this.viewModeTmp);

    if (this.viewModeTmp === 'week') {
      const s = this.startOfWeek(from, this.weekSystem());
      this.currentDate.set(s);
      this.resetWeekPager();
    } else {
      this.currentDate.set(new Date(from));
      this.resetDayPager();
    }

    this.filterPanel?.hide();
    this.cdr.markForCheck();
  }

  // ─────────────────────────────── Estado de la vista ───────────────────────────────

  /** Modo de vista actual (día/semana). */
  readonly viewMode = signal<ViewMode>('day');

  /** Sistema de semana para calcular inicio/fin. */
  readonly weekSystem = signal<WeekSystem>('iso');

  /** Opciones de sistema de semana (por si las expones en un selector). */
  readonly weekSystemOptions = [
    { label: 'ISO (Lunes)', value: 'iso' as WeekSystem },
    { label: 'US (Domingo)', value: 'us' as WeekSystem },
  ] as const;

  /** Fecha activa interna (día base para filtrar/pintar). */
  readonly currentDate = signal<Date>(new Date());

  // ───────────────────────────────  Datos normalizados ───────────────────────────────

  /**
   * Lista de turnos, normalizados a:
   * - `date` siempre presente (ISO)
   * - `start` siempre presente (usa `time` o '00:00' por defecto)
   */
  private _all = signal<(ScheduleEntry & { date: string; start: string })[]>(
    []
  );

  /** Carga/normaliza entradas y reajusta paginación si cambian tamaños. */
  @Input()
  set entries(value: ScheduleEntry[]) {
    const refIso = this.toIso(this.currentDate());
    const norm = (value ?? []).map((e) => {
      const date = e.date ?? refIso;
      const start = e.start ?? e.time ?? '00:00';
      return { ...e, date, start };
    });
    this._all.set(norm);

    if (this.first() >= this.dayTotalRecords()) this.resetDayPager();
    if (this.weekFirst() >= this.weekTotalRecords()) this.resetWeekPager();

    this.cdr.markForCheck();
  }

  // ─────────────────────────────── Utilidades de fecha ───────────────────────────────

  /** Devuelve `YYYY-MM-DD` (ordenable lexicográficamente). */
  private toIso(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${dd}`;
  }

  /** Inicio de semana para una fecha y sistema dado. */
  private startOfWeek(d: Date, sys: WeekSystem): Date {
    const day = d.getDay(); // 0=Dom
    const offset = sys === 'iso' ? (day === 0 ? -6 : 1 - day) : -day;
    const r = new Date(d);
    r.setDate(d.getDate() + offset);
    r.setHours(0, 0, 0, 0);
    return r;
  }

  /** Fin de semana para una fecha y sistema dado. */
  private endOfWeek(d: Date, sys: WeekSystem): Date {
    const s = this.startOfWeek(d, sys);
    const r = new Date(s);
    r.setDate(s.getDate() + 6);
    r.setHours(23, 59, 59, 999);
    return r;
  }

  /** Inicio de la semana de la `currentDate`. */
  wkStartDate(): Date {
    return this.startOfWeek(this.currentDate(), this.weekSystem());
  }

  /** Fin de la semana de la `currentDate`. */
  wkEndDate(): Date {
    return this.endOfWeek(this.currentDate(), this.weekSystem());
  }

  /** Hora actual HH:mm (para comparar contra turnos de hoy). */
  private nowHHmm(): string {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, '0')}:${String(
      d.getMinutes()
    ).padStart(2, '0')}`;
  }

  // ─────────────────────────────── Estado visual por fila ───────────────────────────────

  /** Estado de una fila respecto a hoy: `done` | `on` | `upcoming`. */
  getStatus(row: ScheduleEntry): 'done' | 'on' | 'upcoming' {
    const todayIso = this.toIso(new Date());
    const rowIso = (row as any).date ?? this.toIso(this.currentDate());
    if (rowIso < todayIso) return 'done';
    if (rowIso > todayIso) return 'upcoming';

    const now = this.nowHHmm();
    const start = row.start ?? row.time ?? '';
    const end = row.end;

    if (end && now >= end) return 'done';
    if (start && (!end ? now === start : start <= now && now < end))
      return 'on';
    return 'upcoming';
  }

  /** Orden para agrupar: on(0) < upcoming(1) < done(2). */
  private statusOrder(s: 'done' | 'on' | 'upcoming'): 0 | 1 | 2 {
    return s === 'on' ? 0 : s === 'upcoming' ? 1 : 2;
  }

  /** Etiqueta visible del estado. */
  statusLabel(s: 'done' | 'on' | 'upcoming'): string {
    return s === 'on'
      ? 'En turno'
      : s === 'upcoming'
      ? 'Próximo'
      : 'Finalizado';
  }

  /** Severidad para `<p-tag>`. */
  statusSeverity(
    s: 'done' | 'on' | 'upcoming'
  ): 'success' | 'info' | 'secondary' {
    return s === 'on' ? 'success' : s === 'upcoming' ? 'info' : 'secondary';
  }

  /** Fondo HSL por estado (fila/celda). */
  rowBg(s: 'done' | 'on' | 'upcoming'): string {
    switch (s) {
      case 'on':
        return 'hsl(142 70% 45% / 0.22)';
      case 'upcoming':
        return 'hsl(210 90% 56% / 0.22)';
      case 'done':
        return 'hsl(220 10% 40% / 0.18)';
      default:
        return 'transparent';
    }
  }

  /** Alias para celdas de la vista semana. */
  cellBg(s: 'done' | 'on' | 'upcoming'): string {
    return this.rowBg(s);
  }

  // ─────────────────────────────── Vista DÍA (paginación) ───────────────────────────────

  readonly rowsPerPage = signal(10);
  readonly first = signal(0);

  private dayEntriesRaw = computed(() => {
    const iso = this.toIso(this.currentDate());
    return this._all().filter((e) => e.date === iso);
  });

  /** Orden: on → upcoming → done; y dentro por hora de inicio. */
  readonly dayEntriesSorted = computed(() =>
    this.dayEntriesRaw()
      .slice()
      .sort((a, b) => {
        const oa = this.statusOrder(this.getStatus(a));
        const ob = this.statusOrder(this.getStatus(b));
        if (oa !== ob) return oa - ob;
        return (a.start || '').localeCompare(b.start || '');
      })
  );

  readonly dayTotalRecords = computed(() => this.dayEntriesRaw().length);

  /** Página actual (con placeholders para completar 10 filas). */
  readonly dayPageRows = computed(() => {
    const all = this.dayEntriesSorted();
    const f = this.first();
    const r = this.rowsPerPage();
    const slice = all.slice(f, f + r);
    const pad = Math.max(0, r - slice.length);
    const fillers = Array.from({ length: pad }, (_, i) => ({
      __placeholder: true,
      _id: `ph-${f + i}`,
      date: this.toIso(this.currentDate()),
      start: '',
      end: '',
      employee: '',
      role: '',
    })) as any[];
    return [...slice, ...fillers];
  });

  /** Evento de paginación (Día). */
  onPage(e: TablePageEvent): void {
    this.first.set(e.first ?? 0);
    if (typeof e.rows === 'number' && e.rows > 0) this.rowsPerPage.set(e.rows);
  }

  private resetDayPager(): void {
    this.first.set(0);
  }

  /** Indica si una fila es placeholder (para skeleton/relleno visual). */
  isPlaceholder(row: unknown): boolean {
    return !!(row as any)?.__placeholder;
  }

  // ─────────────────────────────── Vista SEMANA ───────────────────────────────

  readonly weekRowsPerPage = signal(10);
  readonly weekFirst = signal(0);

  /** Días visibles de la semana activa. */
  readonly weekDays = computed(() => {
    const start = this.startOfWeek(this.currentDate(), this.weekSystem());
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return { iso: this.toIso(d), date: d };
    });
  });

  /** Matriz empleado × día con entradas y estado por celda. */
  readonly weekMatrix = computed(() => {
    const days = this.weekDays().map((d) => d.iso);
    const todayIso = this.toIso(new Date());
    const now = this.nowHHmm();

    const map: Record<
      string,
      Record<
        string,
        {
          entries: (ScheduleEntry & { date: string; start: string })[];
          status: 'done' | 'on' | 'upcoming';
        }
      >
    > = {};

    for (const e of this._all()) {
      if (!days.includes(e.date)) continue;
      if (!map[e.employee]) {
        map[e.employee] = {};
        for (const iso of days) {
          map[e.employee][iso] = { entries: [], status: 'done' };
        }
      }
      map[e.employee][e.date].entries.push(e);
    }

    for (const emp of Object.keys(map)) {
      for (const iso of days) {
        const cell = map[emp][iso];
        if (iso < todayIso) {
          cell.status = 'done';
          continue;
        }
        if (iso > todayIso) {
          cell.status = 'upcoming';
          continue;
        }
        let anyOn = false;
        let anyUpcoming = false;

        for (const e of cell.entries) {
          const { start, end } = e;
          if (end && now >= end) continue;
          if (start && (!end ? now === start : start <= now && now < end)) {
            anyOn = true;
          } else if (start && now < start) {
            anyUpcoming = true;
          }
        }
        cell.status = anyOn ? 'on' : anyUpcoming ? 'upcoming' : 'done';
      }
    }

    return map;
  });

  /** Estado "hoy" por empleado para ordenar la semana. */
  private employeeTodayStatus(emp: string): 'done' | 'on' | 'upcoming' {
    const todayIso = this.toIso(new Date());
    const now = this.nowHHmm();
    const todays = this._all().filter(
      (e) => e.employee === emp && e.date === todayIso
    );
    if (!todays.length) {
      const weekIsos = this.weekDays().map((d) => d.iso);
      const hasFuture = this._all().some(
        (e) =>
          e.employee === emp && weekIsos.includes(e.date) && e.date > todayIso
      );
      return hasFuture ? 'upcoming' : 'done';
    }
    for (const e of todays) {
      const { start, end } = e;
      if (end && now >= end) continue;
      if (start && (!end ? now === start : start <= now && now < end))
        return 'on';
      if (start && now < start) return 'upcoming';
    }
    return 'done';
  }

  /** Empleados ordenados por estado de hoy y alfabético. */
  readonly weekEmployeesSorted = computed(() => {
    const days = this.weekDays().map((d) => d.iso);
    const set = new Set<string>();
    for (const e of this._all()) if (days.includes(e.date)) set.add(e.employee);
    return Array.from(set).sort((a, b) => {
      const oa = this.statusOrder(this.employeeTodayStatus(a));
      const ob = this.statusOrder(this.employeeTodayStatus(b));
      if (oa !== ob) return oa - ob;
      return a.localeCompare(b);
    });
  });

  readonly weekTotalRecords = computed(() => this.weekEmployeesSorted().length);

  /** Página de empleados (con placeholders para completar). */
  readonly weekPageEmployees = computed(() => {
    const list = this.weekEmployeesSorted();
    const f = this.weekFirst();
    const r = this.weekRowsPerPage();
    const slice = list.slice(f, f + r);
    const pad = Math.max(0, r - slice.length);
    const fillers = Array.from({ length: pad }, (_, i) => ({
      __placeholder: true,
      _id: `wph-${f + i}`,
    })) as any[];
    return [...slice, ...fillers];
  });

  /** Evento de paginación (Semana). */
  onWeekPage(e: TablePageEvent): void {
    this.weekFirst.set(e.first ?? 0);
    if (typeof e.rows === 'number' && e.rows > 0)
      this.weekRowsPerPage.set(e.rows);
  }

  private resetWeekPager(): void {
    this.weekFirst.set(0);
  }

  /** Es placeholder en tabla semana. */
  isWeekPlaceholder(row: unknown): boolean {
    return !!(row as any)?.__placeholder;
  }

  // Helpers semana
  public weekCell(emp: string, iso: string) {
    const m = this.weekMatrix();
    return m[emp]?.[iso] ?? { entries: [], status: 'done' as const };
  }
  weekCellStatus(emp: string, iso: string) {
    return this.weekCell(emp, iso).status;
  }
  weekCellHasEntries(emp: string, iso: string): boolean {
    return this.weekCell(emp, iso).entries.length > 0;
  }
  weekCellFirstEntry(emp: string, iso: string) {
    return this.weekCell(emp, iso).entries[0];
  }

  // ─────────────────────────────── Ciclo de vida ───────────────────────────────

  private _timer: ReturnType<typeof setInterval> | null = null;

  constructor(private readonly cdr: ChangeDetectorRef) {}

  /** Re-pinta cada minuto para refrescar estados 'on/upcoming/done'. */
  ngOnInit(): void {
    const msToNextMinute = (60 - new Date().getSeconds()) * 1000 + 50;
    setTimeout(() => {
      this.cdr.markForCheck();
      this._timer = setInterval(() => this.cdr.markForCheck(), 60_000);
    }, msToNextMinute);
  }

  ngOnDestroy(): void {
    if (this._timer) clearInterval(this._timer);
  }
}
