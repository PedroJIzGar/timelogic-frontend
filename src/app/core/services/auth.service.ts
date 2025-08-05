import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';

interface TokenPayload {
  exp: number;
  role?: string;
  sub?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly TOKEN_KEY = 'authToken';

  constructor(private router: Router) {}

  login(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    this.router.navigate(['/auth/login']);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) return true;

    try {
      const decoded = jwtDecode<TokenPayload>(token);
      const now = Math.floor(Date.now() / 1000);
      return decoded.exp < now;
    } catch (e) {
      return true;
    }
  }

  getUserRole(): string | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      const decoded = jwtDecode<TokenPayload>(token);
      return decoded.role || null;
    } catch (e) {
      return null;
    }
  }
}
