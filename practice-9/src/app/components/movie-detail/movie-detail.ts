import { Component, signal } from '@angular/core';
import { inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { map, switchMap, of } from 'rxjs';
import { Movie } from '../../services/api';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { loadMovie } from '../movie-list/state/movies.actions';
import { selectSelectedItem, selectDetailsLoading, selectDetailsError } from '../movie-list/state/movies.selectors';

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
  movie = signal<Movie | null>(null);
  loading = signal<boolean>(true);
  error = signal<string | null>(null);

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
      this.store.select(selectSelectedItem).subscribe((m) => this.movie.set(m));
      this.store.select(selectDetailsLoading).subscribe((l) => this.loading.set(!!l));
      this.store.select(selectDetailsError).subscribe((e) => this.error.set(e ? String(e) : null));
    });
  }

  back(){
    this.router.navigate(['../'], {relativeTo: this.route});
  }
}
