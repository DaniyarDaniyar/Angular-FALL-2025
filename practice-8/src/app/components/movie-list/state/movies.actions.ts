import { createAction, props } from '@ngrx/store';
import { Movie, MoviePoster } from '../../../services/api';

export const loadMovies = createAction(
	'[Movies] Load Movies',
	props<{ term: string; page?: number }>()
);

export const loadMoviesSuccess = createAction(
	'[Movies] Load Movies Success',
	props<{ movies: MoviePoster[]; totalResults?: number; page?: number }>()
);

export const loadMoviesFailure = createAction(
	'[Movies] Load Movies Failure',
	props<{ error: any }>()
);

export const loadMovie = createAction(
	'[Movies] Load Movie',
	props<{ id: string }>()
);

export const loadMovieSuccess = createAction(
	'[Movies] Load Movie Success',
	props<{ movie: Movie }>()
);

export const loadMovieFailure = createAction(
	'[Movies] Load Movie Failure',
	props<{ error: any }>()
);
