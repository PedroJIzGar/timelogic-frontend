import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {

  constructor(private authService: AuthService, private router: Router) {}

  login() {
    const fakeToken = 'authToken'; // Esto luego será una respuesta de API
    this.authService.login(fakeToken);
    this.router.navigate(['/dashboard']);
  }

}
