import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MoviePoster } from '../../services/api';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { debounceTime, map } from 'rxjs';
import { Store } from '@ngrx/store';
import { loadMovies } from './state/movies.actions';
import { selectItems } from './state/movies.selectors';

@Component({
  selector: 'movie-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './movie-list.html',
  styleUrls: ['./movie-list.css'],
})
export class MovieList implements OnInit {
  movies = signal<MoviePoster[]>([]);
  currentPage = signal(1);

  query = signal(''); 
  selectedMovie = signal<MoviePoster | null>(null);
  Show = signal(false);

  constructor(private store: Store, private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    this.route.queryParamMap
      .pipe(
        map((params) => params.get('search') || ''),
        debounceTime(300)
      )
      .subscribe((search) => {
        this.query.set(search);

        if (!search.trim()) {
          this.movies.set([]);
          return;
        }

        this.loadMovies(search);
      });

    // subscribe to store items
    this.store.select(selectItems).subscribe((list) => this.movies.set(list || []));
  }

  loadMovies(term: string) {
    this.store.dispatch(loadMovies({ term, page: 1 }));
    this.currentPage.set(1);
  }

  onInput(e: Event) {
    const value = (e.target as HTMLInputElement).value;

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { search: value },
      queryParamsHandling: 'merge',
    });
  }

  loadMore() {
    const nextPage = this.currentPage() + 1;
    this.store.dispatch(loadMovies({ term: this.query(), page: nextPage }));
    this.currentPage.set(nextPage);
  }

  ToggleFn(movie: MoviePoster) {
    if (this.selectedMovie()?.imdbID === movie.imdbID) {
      this.Show.update((v: boolean) => !v);
    } else {
      this.selectedMovie.set(movie);
      this.Show.set(true);
    }
  }
}
