import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Api, MoviePoster } from '../../services/api';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { debounceTime, map } from 'rxjs';

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

  constructor(
    private api: Api,
    private route: ActivatedRoute,
    private router: Router
  ) {}

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
  }

  loadMovies(term: string) {
    this.api.getMovies(term).subscribe({
      next: (data: any) => {
        this.movies.set(data.Search || []);
        this.currentPage.set(1);
      },
      error: (err) => console.error(err),
    });
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

    this.api.getMovies(this.query(), nextPage).subscribe({
      next: (data: any) => {
        const newMovies = data.Search || [];
        this.movies.update((old: any) => [...old, ...newMovies]);
        this.currentPage.set(nextPage);
      },
      error: (err) => console.error(err),
    });
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
