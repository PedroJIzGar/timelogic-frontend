import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { KpiItem, KpiCardsComponent } from './kpi-cards/kpi-cards.component';
import {
  ScheduleEntry,
  ScheduleOverviewComponent,
} from './schedule-overview/schedule-overview.component';
import {
  PendingRequest,
  PendingRequestsComponent,
} from './pending-requests/pending-requests.component';
import { FormsModule } from '@angular/forms';
import { PunchClockComponent } from './punch-clock/punch-clock.component';
import { AssignTaskComponent } from './assign-task/assign-task.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    DividerModule,
    KpiCardsComponent,
    ScheduleOverviewComponent,
    PendingRequestsComponent,
    FormsModule,
    PunchClockComponent,
    AssignTaskComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  today = new Date();

  kpis: KpiItem[] = [
    {
      key: 'vacaciones',
      label: 'Vacaciones',
      icon: 'pi pi-sun',
      main: { label: 'Personas', value: 3, unit: 'pers', target: 10 },
      secondary: { label: 'Horas', value: 24, unit: 'h', target: 80 },
    },
    {
      key: 'horas',
      label: 'Horas gastadas',
      icon: 'pi pi-clock',
      main: { label: 'Hoy', value: 6, unit: 'h', target: 8 },
      secondary: { label: 'Semana', value: 28, unit: 'h', target: 40 },
    },
    {
      key: 'tareas',
      label: 'Tareas del día',
      icon: 'pi pi-list-check',
      main: { value: 9, target: 12 },
      trend: 'up',
    },
    {
      key: 'peticiones',
      label: 'Peticiones',
      icon: 'pi pi-inbox',
      main: { value: 4 },
      trend: 'flat',
    },
    {
      key: 'incidencias',
      label: 'Incidencias',
      icon: 'pi pi-exclamation-triangle',
      main: { value: 1 },
      trend: 'down',
    },
  ];

  schedule: ScheduleEntry[] = [
    { start: '08:00', end: '13:00', employee: 'Laura', role: 'Recepción' },
    { start: '09:00', end: '13:00', employee: 'Carlos', role: 'Ventas' },
    { start: '10:00', end: '11:00', employee: 'Nora', role: 'Soporte' },
    { start: '13:00', end: '14:00', employee: 'Iván', role: 'Almacén' },
  ];

  requests: PendingRequest[] = [
    {
      id: 1,
      employee: 'Laura',
      type: 'Permiso',
      submittedAt: '19/08/2025 08:42',
      notes: 'Mañana completa',
    },
    {
      id: 2,
      employee: 'Carlos',
      type: 'Cambio turno',
      submittedAt: '19/08/2025 09:10',
    },
    {
      id: 3,
      employee: 'Nora',
      type: 'Vacaciones',
      submittedAt: '18/08/2025 16:55',
      notes: '2 días',
    },
  ];

  // handlers opcionales (recibir eventos)
  onApproveRequest(r: PendingRequest) {
    // TODO: llamar API -> /requests/{id}/approve
    console.log('APROBAR', r);
  }
  onRejectRequest(r: PendingRequest) {
    // TODO: llamar API -> /requests/{id}/reject
    console.log('RECHAZAR', r);
  }
}
