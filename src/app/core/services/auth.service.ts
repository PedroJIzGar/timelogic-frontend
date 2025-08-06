// src/app/core/services/auth.service.ts
import { Injectable } from '@angular/core';
import {
  Auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  UserCredential,
  getIdToken
} from '@angular/fire/auth';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private tokenSubject = new BehaviorSubject<string | null>(null);
  token$ = this.tokenSubject.asObservable();

  constructor(private auth: Auth) { }

  // LOGIN
  async login(email: string, password: string): Promise<void> {
    const userCredential: UserCredential = await signInWithEmailAndPassword(this.auth, email, password);
    const token = await getIdToken(userCredential.user);
    this.tokenSubject.next(token);
    localStorage.setItem('token', token); //despues cambiar a cookies
  }

  // REGISTER
  async register(email: string, password: string): Promise<void> {
    const userCredential: UserCredential = await createUserWithEmailAndPassword(this.auth, email, password);
    const token = await getIdToken(userCredential.user);
    this.tokenSubject.next(token);
    localStorage.setItem('token', token);
  }

  // LOGOUT
  async logout(): Promise<void> {
    await signOut(this.auth);
    this.tokenSubject.next(null);
    localStorage.removeItem('token');
  }

  // GET TOKEN
  getToken(): string | null {
    return this.tokenSubject.value || localStorage.getItem('token');
  }
}
