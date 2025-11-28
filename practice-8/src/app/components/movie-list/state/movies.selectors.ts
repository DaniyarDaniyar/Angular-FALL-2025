import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ItemsState, selectFeatureKey } from './movies.reducer';

const selectMoviesFeature = createFeatureSelector<ItemsState>(selectFeatureKey);

export const selectItems = createSelector(
	selectMoviesFeature,
	(state) => state.items
);

export const selectTotalResults = createSelector(
	selectMoviesFeature,
	(state) => state.totalResults
);

export const selectListLoading = createSelector(
	selectMoviesFeature,
	(state) => state.loadingList
);

export const selectListError = createSelector(
	selectMoviesFeature,
	(state) => state.listError
);

export const selectSelectedItem = createSelector(
	selectMoviesFeature,
	(state) => state.selected
);

export const selectDetailsLoading = createSelector(
	selectMoviesFeature,
	(state) => state.loadingDetails
);

export const selectDetailsError = createSelector(
	selectMoviesFeature,
	(state) => state.detailsError
);
