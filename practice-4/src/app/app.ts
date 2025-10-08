import { Component, signal } from '@angular/core';
import { NewComp } from './components/new-comp/new-comp';

@Component({
  selector: 'app-root',
  imports: [NewComp],
  templateUrl: './app.html',
  styleUrl: './app.css',
  standalone: true,
})

export class App {
  protected readonly title = signal('practice-4');
}
