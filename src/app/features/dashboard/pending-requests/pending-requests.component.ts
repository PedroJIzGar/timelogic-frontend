import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';

/**
 * Posibles estados de una petición pendiente.
 *
 * - `pending` → La petición aún no ha sido revisada.
 * - `approved` → La petición ha sido aprobada.
 * - `rejected` → La petición ha sido rechazada.
 */
export type RequestStatus = 'pending' | 'approved' | 'rejected';

/**
 * Representa una petición realizada por un empleado.
 *
 * @property id Identificador único de la petición.
 * @property employee Nombre del empleado que realiza la petición.
 * @property type Tipo de petición (ej. "Cambio turno", "Permiso").
 * @property submittedAt Fecha/hora en la que se envió la petición.
 * @property notes Observaciones adicionales que acompañan a la petición.
 * @property status Estado actual de la petición (por defecto `'pending'`).
 */
export interface PendingRequest {
  id: number | string;
  employee: string;
  type: string;
  submittedAt?: string;
  notes?: string;
  status?: RequestStatus;
}

/**
 * Componente accesible y optimizado para mostrar peticiones pendientes.
 *
 * - Permite aprobar o rechazar con acciones rápidas (botones).
 * - Expone eventos para que el padre pueda reaccionar a los cambios.
 * - Incluye soporte A11y (lectores de pantalla, roles y aria).
 *
 * @example
 * ```html
 * <app-pending-requests
 *   [requests]="myRequests"
 *   (approve)="onApprove($event)"
 *   (reject)="onReject($event)">
 * </app-pending-requests>
 * ```
 */
@Component({
  selector: 'app-pending-requests',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule, TagModule],
  templateUrl: './pending-requests.component.html',
  styleUrls: ['./pending-requests.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PendingRequestsComponent {
  /**
   * Lista de peticiones a mostrar.
   * Si alguna no incluye `status`, se inicializa automáticamente como `'pending'`.
   */
  @Input() set requests(value: PendingRequest[]) {
    const list = (value ?? []).map((r) => ({
      ...r,
      status: r.status ?? ('pending' as RequestStatus),
    }));
    this._items.set(list);
  }
  get requests(): PendingRequest[] {
    return this._items();
  }

  /**
   * Evento emitido cuando una petición es aprobada.
   */
  @Output() approve = new EventEmitter<PendingRequest>();

  /**
   * Evento emitido cuando una petición es rechazada.
   */
  @Output() reject = new EventEmitter<PendingRequest>();

  /** Estado interno reactivo con las peticiones. */
  protected _items = signal<PendingRequest[]>([]);

  /**
   * Función usada en *ngFor para optimizar el renderizado.
   * @param _ index en la lista
   * @param r petición actual
   */
  trackById = (_: number, r: PendingRequest) => r.id;

  /**
   * Devuelve la severidad del tag según el estado.
   * @param s estado de la petición
   */
  statusSeverity(s: RequestStatus) {
    return s === 'pending'
      ? 'warning'
      : s === 'approved'
      ? 'success'
      : 'danger';
  }

  /**
   * Marca una petición como aprobada y emite el evento correspondiente.
   * @param r petición a aprobar
   */
  onApprove(r: PendingRequest) {
    this._items.update((list) =>
      list.map((x) => (x.id === r.id ? { ...x, status: 'approved' } : x))
    );
    this.approve.emit({ ...r, status: 'approved' });
  }

  /**
   * Marca una petición como rechazada y emite el evento correspondiente.
   * @param r petición a rechazar
   */
  onReject(r: PendingRequest) {
    this._items.update((list) =>
      list.map((x) => (x.id === r.id ? { ...x, status: 'rejected' } : x))
    );
    this.reject.emit({ ...r, status: 'rejected' });
  }
}
