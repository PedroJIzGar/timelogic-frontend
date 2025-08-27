import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { TagModule } from 'primeng/tag';
import { RippleModule } from 'primeng/ripple';
import { CardModule } from 'primeng/card';

/** Tipos de evento del historial */
type EventType = 'Entrada' | 'Salida' | 'Pausa' | 'Reanudación';
/** Evento del historial */
interface PunchEvent {
  id: string;
  type: EventType;
  at: string; // ISO string
  note?: string;
}

// ... imports arriba

@Component({
  selector: 'app-punch-clock',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    FormsModule,
    DialogModule,
    ButtonModule,
    InputTextareaModule,
    RippleModule,
    TagModule,
  ],
  templateUrl: './punch-clock.component.html',
  styleUrls: ['./punch-clock.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PunchClockComponent implements OnInit, OnDestroy {
  // ===== estado principal =====
  isWorking = signal<boolean>(false);
  isPaused = signal<boolean>(false);
  private lastIn = signal<Date | null>(null);
  private pausedAt = signal<Date | null>(null);
  private totalPausedMs = signal<number>(0);
  private now = signal<Date>(new Date());

  // ===== diálogo de pausa =====
  pauseDialogVisible = signal<boolean>(false);

  /** Texto libre del textarea */
  pauseText: string = '';

  // ===== historial =====
  private readonly MAX_HISTORY = 30;
  private _events = signal<PunchEvent[]>([]);
  eventsView = computed(() => this._events());

  // ===== accesibilidad =====
  live = signal<string>('');

  // ===== derivados para UI =====
  stateLabel = computed(() => {
    if (this.isPaused()) return 'En pausa';
    return this.isWorking() ? 'En turno' : 'Fuera de turno';
  });
  stateSeverity = computed(() => {
    if (this.isPaused()) return 'warning';
    return this.isWorking() ? 'success' : 'secondary';
  });

  btnText = computed(() =>
    this.isWorking() ? 'Fichar salida' : 'Fichar entrada'
  );
  btnIcon = computed(() =>
    this.isWorking() ? 'pi pi-sign-out' : 'pi pi-sign-in'
  );
  btnSeverity = computed(() => (this.isWorking() ? 'danger' : 'success'));

  /** Contador central */
  counter = computed(() => {
    const now = this.now();
    if (!this.isWorking()) return this.hhmmss(now);

    const start = this.lastIn();
    if (!start) return '--:--:--';

    let ms = now.getTime() - start.getTime() - this.totalPausedMs();
    if (this.isPaused() && this.pausedAt()) {
      ms -= now.getTime() - this.pausedAt()!.getTime();
    }

    if (ms < 0) return '--:--:--';

    const h = Math.floor(ms / 3_600_000);
    const m = Math.floor((ms % 3_600_000) / 60_000);
    const s = Math.floor((ms % 60_000) / 1_000);
    return `${this.pad(h)}:${this.pad(m)}:${this.pad(s)}`;
  });

  private timerId: any;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.timerId = setInterval(() => {
      this.now.set(new Date());
      this.cdr.markForCheck();
    }, 1000);
  }
  ngOnDestroy(): void {
    clearInterval(this.timerId);
  }

  // ===== acciones =====
  toggleWork(): void {
    const now = new Date();
    if (!this.isWorking()) {
      // Entrada
      this.lastIn.set(now);
      this.totalPausedMs.set(0);
      this.isWorking.set(true);
      this.isPaused.set(false);
      this.pushEvent('Entrada', now);
      this.announce(`Entrada registrada a las ${this.hhmm(now)}.`);
    } else {
      // Salida
      this.isWorking.set(false);
      this.isPaused.set(false);
      this.pushEvent('Salida', now);
      this.announce(`Salida registrada a las ${this.hhmm(now)}.`);
    }
  }

  openPause(): void {
    if (!this.isWorking() || this.isPaused()) return;
    this.pauseText = '';
    this.pauseDialogVisible.set(true);
  }

  confirmPause(): void {
    const note = this.pauseText.trim();
    if (!note) return;

    this.isPaused.set(true);
    this.pausedAt.set(new Date());
    this.pushEvent('Pausa', new Date(), note);
    this.pauseDialogVisible.set(false);
    this.announce('Pausa registrada.');
  }

  resumeWork(): void {
    if (!this.isPaused() || !this.pausedAt()) return;
    const now = new Date();
    const pausedMs = now.getTime() - this.pausedAt()!.getTime();
    this.totalPausedMs.update((v) => v + pausedMs);

    this.isPaused.set(false);
    this.pausedAt.set(null);
    this.pushEvent('Reanudación', now);
    this.announce('Reanudación registrada.');
  }

  // ===== historial =====
  private pushEvent(type: EventType, when: Date, note?: string) {
    const evt: PunchEvent = {
      id: when.toISOString(),
      type,
      at: when.toISOString(),
      note: note || undefined,
    };
    this._events.update((list) => {
      const next = [evt, ...list];
      return next.length > this.MAX_HISTORY
        ? next.slice(0, this.MAX_HISTORY)
        : next;
    });
  }
  trackByEvent = (_: number, e: PunchEvent) => e.id;

  // ===== utilidades =====
  private announce(msg: string) {
    this.live.set('');
    setTimeout(() => this.live.set(msg), 30);
  }
  private pad(n: number) {
    return String(n).padStart(2, '0');
  }
  private hhmm(d: Date) {
    return `${this.pad(d.getHours())}:${this.pad(d.getMinutes())}`;
  }
  private hhmmss(d: Date) {
    return `${this.pad(d.getHours())}:${this.pad(d.getMinutes())}:${this.pad(
      d.getSeconds()
    )}`;
  }
}
