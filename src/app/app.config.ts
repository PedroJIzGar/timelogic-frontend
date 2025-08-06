// app.config.ts
import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './core/interceptiors/auth.interceptor';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

// Firebase (tree-shakable modular API)
import { provideFirebaseApp } from '@angular/fire/app';
import { provideAuth } from '@angular/fire/auth';
import { provideFirestore } from '@angular/fire/firestore';

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

import { environment } from '../environments/environment';

function initFirebaseApp() {
  return initializeApp(environment.firebaseConfig);
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideAnimationsAsync(),
    importProvidersFrom(provideFirebaseApp(() => initFirebaseApp())),
    importProvidersFrom(provideFirestore(() => getFirestore())),
    importProvidersFrom(provideAuth(() => getAuth()))
  ]
};