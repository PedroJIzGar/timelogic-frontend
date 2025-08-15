import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [CommonModule, RouterModule, CardModule, ButtonModule, ToastModule],
  providers: [MessageService],
  templateUrl: './verify-email.component.html',
  styleUrls: ['./verify-email.component.scss'],
})
export class VerifyEmailComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  private messages = inject(MessageService);
  loading = signal(false);

  async resend(): Promise<void> {
    try {
      this.loading.set(true);
      await this.auth.sendEmailVerificationEmail();
      this.messages.add({ severity: 'success', summary: 'Correo enviado', life: 2500 });
    } finally {
      this.loading.set(false);
    }
  }

  goLogin() { this.router.navigate(['/auth/login']); }
}
