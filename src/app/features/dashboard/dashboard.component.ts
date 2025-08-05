import { Component } from '@angular/core';
import { ScheduleTableComponent } from './schedule-table/schedule-table.component';
import { MatCard } from "@angular/material/card";

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [ScheduleTableComponent, MatCard],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  today = new Date();

  mockData = [
    {
      employeeName: 'Pedro García',
      timeSlots: ['08:00', '08:15', '08:30', '08:45', '09:00']
    },
    {
      employeeName: 'Lucía Ruiz',
      timeSlots: ['10:00', '10:15', '10:30']
    }
  ];
}
