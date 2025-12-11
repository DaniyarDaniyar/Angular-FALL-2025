import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FavoritesService } from '../../services/favorites.service';
import { Api, Movie } from '../../services/api';
import { combineLatest, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-my-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './my-list.html',
  styleUrl: './my-list.css'
})
export class MyList implements OnInit {
  private favoritesService = inject(FavoritesService);
  private api = inject(Api);
  private router = inject(Router);

  movies = signal<Movie[]>([]);
  loading = signal<boolean>(true);
  error = signal<string | null>(null);
  message = signal<string | null>(null);

  ngOnInit(): void {
    this.loadFavorites();
    
    // Show message if user just logged in
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('merged') === 'true') {
      this.message.set('Ваши избранные фильмы из локального хранилища были объединены с вашим аккаунтом!');
      setTimeout(() => this.message.set(null), 5000);
    }
  }


  loadFavorites(): void {
    this.loading.set(true);
    this.error.set(null);

    this.favoritesService.favorites$.pipe(
      switchMap(favoriteIds => {
        if (favoriteIds.length === 0) {
          return of([[], []] as [Movie[], string[]]); 
        }

        const movieObservables = favoriteIds.map(id => 
          this.api.getMovie(id)
        );

        return combineLatest(movieObservables).pipe(
          map(movies => [movies, favoriteIds] as [Movie[], string[]])
        );
      })
    ).subscribe({
      next: ([movies, ids]: [Movie[], string[]]) => {
        // Filter out any failed requests (movies without Title)
        const validMovies = movies.filter(m => m?.Title);
        this.movies.set(validMovies);
        this.loading.set(false);
        
        if (ids.length > 0 && validMovies.length === 0) {
          this.error.set('Не удалось загрузить избранные фильмы. Попробуйте позже.');
        } else if (ids.length === 0) {
          // This will now work correctly
          this.error.set('У вас пока нет избранных фильмов. Добавьте фильмы в избранное!');
        }
      },
      error: (err) => {
        this.error.set('Ошибка при загрузке избранных фильмов: ' + (err?.message || 'Неизвестная ошибка'));
        this.loading.set(false);
      }
    });
  }
  

  removeFromFavorites(movieId: string): void {
    this.favoritesService.removeFavorite(movieId).then(() => {
      // Reload favorites
      this.loadFavorites();
    });
  }

  goToMovieDetail(movieId: string): void {
    this.router.navigate(['/movies', movieId]);
  }
}



