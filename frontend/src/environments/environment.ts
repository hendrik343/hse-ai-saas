nano src/app/app.config.ts

  production: false,
  firebaseConfig: {
    apiKey: "AIzaSyBzoX3mxJCTiaR4CMm99lmB8NfLlkt9Otk",
    authDomain: "hse-ai-saas.firebaseapp.com",
    projectId: "hse-ai-saas",
    storageBucket: "hse-ai-saas.appspot.com",
    messagingSenderId: "674061620385",
    appId: "1:674061620385:web:fbf66dfc81cd9168728ce0",
    measurementId: "G-MCC4GG1VJE"
  }
};nano src/app/app.config.ts
import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { provideAuth, getAuth } from '@angular/fire/auth';

import { environment } from '../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    importProvidersFrom(
      provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
      provideFirestore(() => getFirestore()),
      provideAuth(() => getA
nano src/environments/environment.ts

