import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-unauthorize',
  standalone: true,
  imports: [RouterModule, CommonModule, CardModule, ButtonModule],
  templateUrl: './unauthorize.component.html',
  styleUrl: './unauthorize.component.scss'
})
export class UnauthorizeComponent {

  private router = inject(Router);

  back() {
    this.router.navigate(['/dashboard']);
  }

  login() {
    this.router.navigate(['/auth/login']);
  }
}
