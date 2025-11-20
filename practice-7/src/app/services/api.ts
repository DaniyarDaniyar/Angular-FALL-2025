import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface MoviePoster {
  Title: string;
  Year: string;
  imdbID: string;
  Type: string;
  Poster: string;
}
export interface Movie {
  Title: string;
  Year: string;
  Rated: string;
  Released: string;
  Runtime: string;
  Genre: string;
  Director: string;
  Writer: string;
  Actors: string;
  Plot: string;
  Language: string;
  Country: string;
  Awards: string;
  Poster: string;
  imdbRating: string;
  imdbID: string;
}

@Injectable({
  providedIn: 'root'
})
export class Api {
  private apiUrl = 'https://www.omdbapi.com/?apikey=8ccacbd3';

  constructor(private http: HttpClient) {}

  getMovies(term: string, page: number = 1): Observable<any> {
    const termRequest = `&s=${term}`;
    return this.http.get(`${this.apiUrl}${termRequest}&page=${page}`);
  }
  getMovie(id: string | number): Observable<Movie>{
    return this.http.get<Movie>(`${this.apiUrl}&i=${id}`);
  }
  
}
