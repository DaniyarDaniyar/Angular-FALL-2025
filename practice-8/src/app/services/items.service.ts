import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Api, Movie, MoviePoster } from './api';

@Injectable({ providedIn: 'root' })
export class ItemsService {
  constructor(private api: Api) {}

  getItems(query: { term: string; page?: number }): Observable<any> {
    return this.api.getMovies(query.term, query.page);
  }

  getItemById(id: string | number): Observable<Movie> {
    return this.api.getMovie(id);
  }
}
