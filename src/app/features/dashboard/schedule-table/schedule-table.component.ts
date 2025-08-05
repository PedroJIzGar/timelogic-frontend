import { CommonModule } from '@angular/common';
import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-schedule-table',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatGridListModule],
  templateUrl: './schedule-table.component.html',
  styleUrl: './schedule-table.component.scss'
})
export class ScheduleTableComponent {
  @Input() currentDate: Date = new Date(); // dinámica
  @Input() scheduleData: any[] = []; // ← datos de empleados y tramos
  @ViewChild('pdfContent', { static: false }) pdfContent!: ElementRef;

  get hourLabels(): string[] {
    const hours: string[] = [];
    for (let h = 7; h < 24; h++) {
      hours.push(`${h.toString().padStart(2, '0')}:00`);
    }
    return hours;
  }

  get formattedDate(): string {
    return this.currentDate.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });
  }

  get timeSlots(): string[] {
    const startHour = 7;
    const endHour = 24;
    const slots: string[] = [];

    for (let hour = startHour; hour < endHour; hour++) {
      for (let min of [0, 30]) {
        const from = `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
        const nextHour = min === 30 ? hour + 1 : hour;
        const nextMin = min === 30 ? 0 : 30;
        const to = `${nextHour.toString().padStart(2, '0')}:${nextMin.toString().padStart(2, '0')}`;
        slots.push(`${from} - ${to}`);
      }
    }

    return slots;
  }

exportToPDF(): void {
  const dataElement = document.getElementById('pdf-export-wrapper');
  if (!dataElement) return;

  html2canvas(dataElement, {
    scrollY: -window.scrollY,
    scale: 2 // para mayor resolución
  }).then(canvas => {
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'px',
      format: [canvas.width, canvas.height + 100]
    });

    pdf.addImage({
      imageData: imgData,
      format: 'PNG',
      x: 20,
      y: 40,
      width: canvas.width,
      height: canvas.height
    });

    // Pie de página
    const fecha = new Date().toLocaleDateString();
    pdf.setFontSize(10);
    pdf.text(`Generado el ${fecha}`, 20, canvas.height + 60);
    pdf.text('© TimeLogic. Todos los derechos reservados.', canvas.width - 300, canvas.height + 60);

    pdf.save('Horario_miércoles_16_de_julio.pdf');
  });
}

}
