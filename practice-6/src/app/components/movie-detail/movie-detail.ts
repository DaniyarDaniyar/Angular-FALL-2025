import { Component, signal } from '@angular/core';
import { inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { map, switchMap, of, catchError, finalize } from 'rxjs';
import { Movie, Api } from '../../services/api';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-movie-detail',
  imports: [CommonModule],
  templateUrl: './movie-detail.html',
  styleUrl: './movie-detail.css'
})
export class MovieDetail {
  private route = inject(ActivatedRoute);
  private router = inject(Router)
  private api = inject(Api);
  movie = signal<Movie | null>(null);
  loading = signal<boolean>(true);
  error = signal<string | null>(null);

  constructor(){
    this.route.paramMap.pipe(
      map(param => param.get('id')),
      switchMap(paramId => {
        if (!paramId) {
          this.error.set("Invalid id")
          this.loading.set(false)
          return of(null);
        }
        this.error.set(null);
        this.loading.set(true);
        return this.api.getMovie(paramId).pipe(
          catchError(()=> {
            this.error.set('Failed to load movie details.');
            return of(null);
          }), 
          finalize(() => this.loading.set(false))

        );
      })
    )
    .subscribe((m)=> this.movie.set(m));
  }

  back(){
    this.router.navigate(['../'], {relativeTo: this.route});
  }
}
