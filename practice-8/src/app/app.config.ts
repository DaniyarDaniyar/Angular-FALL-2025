import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection, isDevMode } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';
import { initializeApp } from 'firebase/app';
import 'firebase/auth';
import { provideFirebaseApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { MoviesEffects } from './components/movie-list/state/movies.effects';
import { moviesReducer } from './components/movie-list/state/movies.reducer';
import { provideStoreDevtools } from '@ngrx/store-devtools';

export const firebaseApp = initializeApp(environment.firebase);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideFirebaseApp(() => firebaseApp),
    provideAuth(() => getAuth(firebaseApp)),
    provideRouter(routes),
    provideHttpClient(),
    provideStore({ movies: moviesReducer }),
    provideEffects(MoviesEffects),
    provideStoreDevtools({ maxAge: 25, logOnly: !isDevMode() })
],
};
