
import { createReducer, on } from '@ngrx/store';
import { Movie, MoviePoster } from '../../../services/api';
import {
	loadMovies,
	loadMoviesSuccess,
	loadMoviesFailure,
	loadMovie,
	loadMovieSuccess,
	loadMovieFailure,
} from './movies.actions';

export interface ItemsState {
	items: MoviePoster[];
	totalResults?: number;
	selected: Movie | null;
	loadingList: boolean;
	loadingDetails: boolean;
	listError: any | null;
	detailsError: any | null;
}

export const initialState: ItemsState = {
	items: [],
	totalResults: undefined,
	selected: null,
	loadingList: false,
	loadingDetails: false,
	listError: null,
	detailsError: null,
};

export const moviesReducer = createReducer(
	initialState,
	// Load list
	on(loadMovies, (state) => ({
		...state,
		loadingList: true,
		listError: null,
	})),
	on(loadMoviesSuccess, (state, { movies, totalResults, page }) => ({
		...state,
		items: typeof page === 'number' && page > 1 ? [...state.items, ...movies] : movies,
		totalResults: totalResults ?? state.totalResults,
		loadingList: false,
		listError: null,
	})),
	on(loadMoviesFailure, (state, { error }) => ({
		...state,
		loadingList: false,
		listError: error,
	})),

	// Load single movie
	on(loadMovie, (state) => ({
		...state,
		loadingDetails: true,
		detailsError: null,
		selected: null,
	})),
	on(loadMovieSuccess, (state, { movie }) => ({
		...state,
		selected: movie,
		loadingDetails: false,
		detailsError: null,
	})),
	on(loadMovieFailure, (state, { error }) => ({
		...state,
		loadingDetails: false,
		detailsError: error,
	}))
);

export const selectFeatureKey = 'movies';

