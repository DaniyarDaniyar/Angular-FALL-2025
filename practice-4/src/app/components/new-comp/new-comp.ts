import { Component, OnInit, signal } from '@angular/core';
import {Api, Todo} from '../../services/api';
@Component({
  selector: 'app-new-comp',
  standalone: true,
  templateUrl: './new-comp.html',
  styleUrl: './new-comp.css',
})
export class NewComp implements OnInit {
  todos = signal<Todo[]>([]); 

  constructor(private api: Api) {}

  ngOnInit(): void {}

  loadTodos(): void {
    this.api.getTodos().subscribe({
      next: (data:any) => {
        this.todos.set(data.slice(0, 50)); 
      },
      error: (err:any) => console.error('Error:', err),
    });
  }
}
