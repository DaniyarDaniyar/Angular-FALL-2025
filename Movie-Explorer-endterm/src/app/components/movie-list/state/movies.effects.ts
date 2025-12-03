import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import {
  loadMovies,
  loadMoviesSuccess,
  loadMoviesFailure,
  loadMovie,
  loadMovieSuccess,
  loadMovieFailure,
} from './movies.actions';
import { ItemsService } from '../../../services/items.service';

@Injectable()
export class MoviesEffects {
  loadItems$: any;
  loadItem$: any;

  constructor(private actions$: Actions, private itemsService: ItemsService) {
    this.loadItems$ = createEffect(() =>
      this.actions$.pipe(
        ofType(loadMovies),
        mergeMap(({ term, page }) =>
          this.itemsService.getItems({ term, page }).pipe(
            map((response: any) =>
              loadMoviesSuccess({
                movies: response.Search || [],
                totalResults: response.totalResults ? +response.totalResults : undefined,
                page,
              })
            ),
            catchError((error) => of(loadMoviesFailure({ error })))
          )
        )
      )
    );

    this.loadItem$ = createEffect(() =>
      this.actions$.pipe(
        ofType(loadMovie),
        mergeMap(({ id }) =>
          this.itemsService.getItemById(id).pipe(
            map((movie) => loadMovieSuccess({ movie })),
            catchError((error) => of(loadMovieFailure({ error })))
          )
        )
      )
    );
  }
}
