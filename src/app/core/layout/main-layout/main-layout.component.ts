import { Component, HostListener, NgModule, ViewChild } from '@angular/core';
import { RouterModule, RouterOutlet } from "@angular/router";
import { AuthService } from '../../services/auth.service';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterModule, MatToolbarModule, MatSidenavModule, MatListModule, MatIconModule, MatButtonModule],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss'
})
export class MainLayoutComponent {

  @ViewChild('sidenav') sidenav!: MatSidenav;
  isMobile = window.innerWidth <= 768;
  sidenavOpened = !this.isMobile;
  darkMode = false;

  constructor(private authService: AuthService) {
    const savedMode = localStorage.getItem('darkMode');

    if (savedMode !== null) {
      this.darkMode = savedMode === 'true';
    } else {
      // Detectar el modo del sistema si no hay nada guardado
      this.darkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }

    this.applyDarkMode();
  }

  logout() {
    this.authService.logout();
  }

  @HostListener('window:resize')
  onResize() {
    this.isMobile = window.innerWidth <= 768;
    this.sidenavOpened = !this.isMobile;
  }

  toggleSidenav() {
    this.sidenav.toggle();
  }

  onNavItemClick() {
    if (this.isMobile) {
      this.sidenav.close();
    }
  }

  private applyDarkMode() {
    document.body.classList.toggle('dark-mode', this.darkMode);
  }

  toggleDarkMode() {
    this.darkMode = !this.darkMode;
    localStorage.setItem('darkMode', this.darkMode.toString());
    this.applyDarkMode();
  }

}
