import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface Movie {
  Title: string;
  Year: string;
  imdbID: string;
  Type: string;
  Poster: string;
}

@Injectable({
  providedIn: 'root'
})
export class Api {
  private apiUrl = 'https://www.omdbapi.com/?apikey=8ccacbd3';

  constructor(private http: HttpClient) {}

  getMovies(term: string, page: number = 1): Observable<any> {
    const termRequest = term ? `&s=${term}` : '&s=batman';
    return this.http.get(`${this.apiUrl}${termRequest}&page=${page}`);
  }
  
}
