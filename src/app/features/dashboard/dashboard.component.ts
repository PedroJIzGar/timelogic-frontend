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
  // ============ MARTES 26/08/2025 — 20 empleados (DÍA COMPLETO) ============
  { date: '2025-08-26', start: '08:00', end: '13:00', employee: 'Laura Izquierdo',  role: 'Recepción' },
  { date: '2025-08-26', start: '09:00', end: '13:00', employee: 'Carlos Saez',     role: 'Ventas' },
  { date: '2025-08-26', start: '10:00', end: '14:00', employee: 'Nora Fernandez',  role: 'Soporte' },
  { date: '2025-08-26', start: '13:00', end: '17:00', employee: 'Iván López',      role: 'Almacén' },
  { date: '2025-08-26', start: '16:00', end: '18:30', employee: 'Ana Ruiz',        role: 'RRHH' },
  { date: '2025-08-26', start: '18:00', end: '20:00', employee: 'Diego Martín',    role: 'IT' },
  { date: '2025-08-26', start: '08:30', end: '12:30', employee: 'Sofía Gómez',     role: 'Marketing' },
  { date: '2025-08-26', start: '12:00', end: '16:00', employee: 'Pedro Álvarez',   role: 'Compras' },
  { date: '2025-08-26', start: '09:00', end: '15:00', employee: 'María Torres',    role: 'Finanzas' },
  { date: '2025-08-26', start: '10:00', end: '13:30', employee: 'Javier Romero',   role: 'Logística' },
  { date: '2025-08-26', start: '11:00', end: '14:00', employee: 'Lucía Navarro',   role: 'Calidad' },
  { date: '2025-08-26', start: '13:00', end: '18:00', employee: 'Andrés Pérez',    role: 'Atención' },
  { date: '2025-08-26', start: '08:00', end: '12:00', employee: 'Elena Morales',   role: 'Producción' },
  { date: '2025-08-26', start: '12:00', end: '19:00', employee: 'Hugo Castillo',   role: 'Diseño' },
  { date: '2025-08-26', start: '07:30', end: '11:30', employee: 'Marta Sánchez',   role: 'Jurídico' },
  { date: '2025-08-26', start: '14:00', end: '19:00', employee: 'Raúl Ortega',     role: 'Operaciones' },
  { date: '2025-08-26', start: '09:30', end: '13:00', employee: 'Paula Vidal',     role: 'Seguridad' },
  { date: '2025-08-26', start: '15:00', end: '20:00', employee: 'Sergio Cabrera',  role: 'Mantenimiento' },
  { date: '2025-08-26', start: '08:00', end: '16:00', employee: 'Claudia Núñez',   role: 'Comercial' },
  { date: '2025-08-26', start: '10:30', end: '18:30', employee: 'Tomás Herrera',   role: 'Dirección' },
  // Turno partido para probar "+n" en Semana
  { date: '2025-08-26', start: '15:30', end: '16:30', employee: 'Iván López',      role: 'Almacén' },
  { date: '2025-08-26', start: '19:00', end: '20:00', employee: 'María Torres',    role: 'Finanzas' },

  // ============ LUNES 25/08/2025 — 10 empleados ============
  { date: '2025-08-25', start: '08:00', end: '13:00', employee: 'Laura Izquierdo',  role: 'Recepción' },
  { date: '2025-08-25', start: '09:00', end: '13:00', employee: 'Carlos Saez',     role: 'Ventas' },
  { date: '2025-08-25', start: '10:00', end: '14:00', employee: 'Nora Fernandez',  role: 'Soporte' },
  { date: '2025-08-25', start: '13:00', end: '17:00', employee: 'Iván López',      role: 'Almacén' },
  { date: '2025-08-25', start: '16:00', end: '18:00', employee: 'Ana Ruiz',        role: 'RRHH' },
  { date: '2025-08-25', start: '18:00', end: '20:00', employee: 'Diego Martín',    role: 'IT' },
  { date: '2025-08-25', start: '08:30', end: '12:30', employee: 'Sofía Gómez',     role: 'Marketing' },
  { date: '2025-08-25', start: '12:00', end: '16:00', employee: 'Pedro Álvarez',   role: 'Compras' },
  { date: '2025-08-25', start: '09:00', end: '15:00', employee: 'María Torres',    role: 'Finanzas' },
  { date: '2025-08-25', start: '10:00', end: '13:30', employee: 'Javier Romero',   role: 'Logística' },

  // ============ MIÉRCOLES 27/08/2025 — 12 empleados ============
  { date: '2025-08-27', start: '08:00', end: '12:00', employee: 'Laura Izquierdo',  role: 'Recepción' },
  { date: '2025-08-27', start: '09:00', end: '14:00', employee: 'Carlos Saez',     role: 'Ventas' },
  { date: '2025-08-27', start: '12:00', end: '14:00', employee: 'Nora Fernandez',  role: 'Soporte' },
  { date: '2025-08-27', start: '13:00', end: '15:00', employee: 'Iván López',      role: 'Almacén' },
  { date: '2025-08-27', start: '15:00', end: '18:00', employee: 'Ana Ruiz',        role: 'RRHH' },
  { date: '2025-08-27', start: '18:00', end: '20:00', employee: 'Diego Martín',    role: 'IT' },
  { date: '2025-08-27', start: '09:30', end: '13:30', employee: 'Lucía Navarro',   role: 'Calidad' },
  { date: '2025-08-27', start: '13:00', end: '18:00', employee: 'Andrés Pérez',    role: 'Atención' },
  { date: '2025-08-27', start: '08:00', end: '12:00', employee: 'Elena Morales',   role: 'Producción' },
  { date: '2025-08-27', start: '12:00', end: '19:00', employee: 'Hugo Castillo',   role: 'Diseño' },
  { date: '2025-08-27', start: '07:30', end: '11:30', employee: 'Marta Sánchez',   role: 'Jurídico' },
  { date: '2025-08-27', start: '14:00', end: '19:00', employee: 'Raúl Ortega',     role: 'Operaciones' },

  // ============ JUEVES 28/08/2025 — 8 empleados ============
  { date: '2025-08-28', start: '08:00', end: '13:00', employee: 'Claudia Núñez',   role: 'Comercial' },
  { date: '2025-08-28', start: '10:30', end: '18:30', employee: 'Tomás Herrera',   role: 'Dirección' },
  { date: '2025-08-28', start: '09:30', end: '13:00', employee: 'Paula Vidal',     role: 'Seguridad' },
  { date: '2025-08-28', start: '15:00', end: '20:00', employee: 'Sergio Cabrera',  role: 'Mantenimiento' },
  { date: '2025-08-28', start: '08:30', end: '12:30', employee: 'Sofía Gómez',     role: 'Marketing' },
  { date: '2025-08-28', start: '12:00', end: '16:00', employee: 'Pedro Álvarez',   role: 'Compras' },
  { date: '2025-08-28', start: '10:00', end: '13:30', employee: 'Javier Romero',   role: 'Logística' },
  { date: '2025-08-28', start: '11:00', end: '14:00', employee: 'Lucía Navarro',   role: 'Calidad' },

  // ============ VIERNES 29/08/2025 — 14 empleados ============
  { date: '2025-08-29', start: '08:00', end: '13:00', employee: 'Laura Izquierdo',  role: 'Recepción' },
  { date: '2025-08-29', start: '09:00', end: '12:00', employee: 'Carlos Saez',     role: 'Ventas' },
  { date: '2025-08-29', start: '12:00', end: '14:00', employee: 'Nora Fernandez',  role: 'Soporte' },
  { date: '2025-08-29', start: '13:00', end: '14:00', employee: 'Iván López',      role: 'Almacén' },
  { date: '2025-08-29', start: '16:00', end: '20:00', employee: 'Diego Martín',    role: 'IT' },
  { date: '2025-08-29', start: '08:00', end: '09:00', employee: 'Ana Ruiz',        role: 'RRHH' },
  { date: '2025-08-29', start: '09:30', end: '13:00', employee: 'Paula Vidal',     role: 'Seguridad' },
  { date: '2025-08-29', start: '15:00', end: '20:00', employee: 'Sergio Cabrera',  role: 'Mantenimiento' },
  { date: '2025-08-29', start: '08:00', end: '16:00', employee: 'Claudia Núñez',   role: 'Comercial' },
  { date: '2025-08-29', start: '10:30', end: '18:30', employee: 'Tomás Herrera',   role: 'Dirección' },
  { date: '2025-08-29', start: '12:00', end: '19:00', employee: 'Hugo Castillo',   role: 'Diseño' },
  { date: '2025-08-29', start: '07:30', end: '11:30', employee: 'Marta Sánchez',   role: 'Jurídico' },
  { date: '2025-08-29', start: '13:00', end: '18:00', employee: 'Andrés Pérez',    role: 'Atención' },
  { date: '2025-08-29', start: '09:00', end: '15:00', employee: 'María Torres',    role: 'Finanzas' },
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
