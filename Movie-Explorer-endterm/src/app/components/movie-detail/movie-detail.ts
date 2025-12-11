import { Component, signal, computed } from '@angular/core';
import { inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { map, switchMap, of } from 'rxjs';
import { Movie } from '../../services/api';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { loadMovie } from '../movie-list/state/movies.actions';
import { selectSelectedItem, selectDetailsLoading, selectDetailsError } from '../movie-list/state/movies.selectors';
import { FavoritesService } from '../../services/favorites.service';

@Component({
  selector: 'app-movie-detail',
  imports: [CommonModule],
  templateUrl: './movie-detail.html',
  styleUrl: './movie-detail.css'
})
export class MovieDetail {
  private route = inject(ActivatedRoute);
  private router = inject(Router)
  private store = inject(Store);
  private favoritesService = inject(FavoritesService);
  
  movie = signal<Movie | null>(null);
  loading = signal<boolean>(true);
  error = signal<string | null>(null);
  isFavorite = signal<boolean>(false);
  favoriteMessage = signal<string | null>(null);

  constructor(){
    this.route.paramMap.pipe(
      map(param => param.get('id'))
    ).subscribe((paramId) => {
      if (!paramId) {
        this.error.set('Invalid id');
        this.loading.set(false);
        return;
      }

      this.error.set(null);
      this.loading.set(true);
      this.store.dispatch(loadMovie({ id: paramId }));

      // subscribe to store values
      this.store.select(selectSelectedItem).subscribe((m) => {
        this.movie.set(m);
        if (m?.imdbID) {
          // Check if movie is in favorites
          this.favoritesService.isFavorite(m.imdbID).subscribe(isFav => {
            this.isFavorite.set(isFav);
          });
        }
      });
      this.store.select(selectDetailsLoading).subscribe((l) => this.loading.set(!!l));
      this.store.select(selectDetailsError).subscribe((e) => this.error.set(e ? String(e) : null));
    });
  }

  toggleFavorite(): void {
    const movie = this.movie();
    if (!movie?.imdbID) return;

    if (this.isFavorite()) {
      this.favoritesService.removeFavorite(movie.imdbID).then(() => {
        this.isFavorite.set(false);
        this.favoriteMessage.set('Фильм удалён из избранного');
        setTimeout(() => this.favoriteMessage.set(null), 3000);
      });
    } else {
      this.favoritesService.addFavorite(movie.imdbID).then(() => {
        this.isFavorite.set(true);
        this.favoriteMessage.set('Фильм добавлен в избранное');
        setTimeout(() => this.favoriteMessage.set(null), 3000);
      });
    }
  }

  back(){
    this.router.navigate(['../'], {relativeTo: this.route});
  }
}
