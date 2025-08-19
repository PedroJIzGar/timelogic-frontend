import { Component, EventEmitter, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  Validators,
} from '@angular/forms';
import { CardModule } from 'primeng/card';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { CalendarModule } from 'primeng/calendar';
import { ButtonModule } from 'primeng/button';

interface Employee {
  id: number;
  name: string;
}

@Component({
  selector: 'app-assign-task',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    CardModule,
    DropdownModule,
    InputTextModule,
    InputTextareaModule,
    CalendarModule,
    ButtonModule,
  ],
  templateUrl: './assign-task.component.html',
  styleUrls: ['./assign-task.component.scss'],
})
export class AssignTaskComponent {
  @Output() taskAssigned = new EventEmitter<any>();

  employees: Employee[] = [
    { id: 1, name: 'Ana López' },
    { id: 2, name: 'Pedro García' },
    { id: 3, name: 'Lucía Martínez' },
  ];

  form = this.fb.group({
    employee: [null, Validators.required],
    title: ['', [Validators.required, Validators.minLength(3)]],
    description: ['', Validators.required],
    deadline: [null, Validators.required],
  });

  constructor(private fb: FormBuilder) {}

  submit() {
    if (this.form.valid) {
      this.taskAssigned.emit(this.form.value);
      this.form.reset();
    }
  }
}
