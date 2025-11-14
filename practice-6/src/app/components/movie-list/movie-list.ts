import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Api, MoviePoster } from '../../services/api';
import { Subject, debounceTime, switchMap } from 'rxjs';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'movie-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './movie-list.html',
  styleUrls: ['./movie-list.css'],
})
export class MovieList implements OnInit {
  movies = signal<MoviePoster[]>([]);
  query = '';
  search$ = new Subject<string>();
  currentPage = signal(1);

  
  selectedMovie = signal<MoviePoster | null>(null);
  Show = signal(false);

  constructor(private api: Api) {
    this.search$
      .pipe(
        debounceTime(300),
        switchMap((term: string) => this.api.getMovies(term))
      )
      .subscribe({
        next: (data: any) => {
          this.movies.set(data.Search || []);
          this.currentPage.set(1);
        },
        error: (err: any) => console.error('Error:', err),
      });
  }

  ngOnInit(): void {
    this.api.getMovies('batman').subscribe({
      next: (data: any) => this.movies.set(data.Search || []),
      error: (err: any) => console.error('Error:', err),
    });
  }

  onInput(e: Event) {
    const value = (e.target as HTMLInputElement).value;
    this.query = value;
    this.search$.next(this.query);
  }

  loadMore() {
    const nextPage = this.currentPage() + 1;
    this.api.getMovies(this.query || 'batman', nextPage).subscribe({
      next: (data: any) => {
        const newMovies = data.Search || [];
        this.movies.update((old:any) => [...old, ...newMovies]);
        this.currentPage.set(nextPage);
      },
      error: (err:any) => console.error(err),
    });
  }

  ToggleFn(movie: MoviePoster) {
    if (this.selectedMovie()?.imdbID === movie.imdbID) {
      this.Show.update((v:boolean) => !v);
    } else {
      this.selectedMovie.set(movie);
      this.Show.set(true);
    }
  }
}
