import { Component, OnInit, signal } from '@angular/core';
import {Api, Todo} from '../../services/api';
import { Subject, debounceTime, switchMap } from 'rxjs';
@Component({
  selector: 'app-new-comp',
  standalone: true,
  templateUrl: './new-comp.html',
  styleUrl: './new-comp.css',
})
export class NewComp implements OnInit {
  todos = signal<Todo[]>([]); 
  query = '';
  search$ = new Subject<string>();

  constructor(private api: Api) {
    this.search$.pipe(
      debounceTime(300),
      switchMap((term:string) => this.api.getTodos(term))
    ).subscribe({
      next: (data:any) => {
        this.todos.set(data); 
      },
      error: (err:any) => console.error('Error:', err),
    });
  }

  ngOnInit(): void {}

  onInput(e: Event){
    const target = (e.target as HTMLInputElement).value;
    this.query = target;
    this.search$.next(this.query);
  }

  loadTodos(): void {
    this.query = '';
    this.api.getTodos('').subscribe({
      next: (data:any) => {
        this.todos.set(data); 
      },
      error: (err:any) => console.error('Error:', err),
    });
  }
}
