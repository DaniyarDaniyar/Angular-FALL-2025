import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface Todo {
  userId: number;
  id: number;
  title: string;
  completed: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class Api {
  private todoUrl = 'https://jsonplaceholder.typicode.com/todos';

  constructor(private http: HttpClient) {}
  getTodos(term: string): Observable<Todo[]>{
    const termRequest = term ? `?title_like=${term}` : '';
    return this.http.get<Todo[]>(`${this.todoUrl}${termRequest}`);
  } 
}
