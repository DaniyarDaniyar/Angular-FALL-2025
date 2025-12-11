import { ApplicationConfig, provideZonelessChangeDetection, isDevMode } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideServiceWorker } from '@angular/service-worker';
import { provideBrowserGlobalErrorListeners } from '@angular/core';

// Angular Fire Imports
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { provideStorage, getStorage } from '@angular/fire/storage';

// State Management
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { moviesReducer } from './components/movie-list/state/movies.reducer';
import { MoviesEffects } from './components/movie-list/state/movies.effects';

// Environment
import { routes } from './app.routes';
import { environment } from '../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideHttpClient(),

    // --- FIX STARTS HERE ---
    // 1. Initialize the app INSIDE the provider
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    
    // 2. Remove arguments from these functions. 
    // The library automatically injects the default app.
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    provideStorage(() => getStorage()),
    // --- FIX ENDS HERE ---

    provideStore({ movies: moviesReducer }),
    provideEffects(MoviesEffects),
    provideStoreDevtools({ maxAge: 25, logOnly: !isDevMode() }),
    
    // Fixed: You had this listed twice in your original code
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000'
    })
  ],
};