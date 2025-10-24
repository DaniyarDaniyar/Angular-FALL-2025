import { Component, signal } from '@angular/core';
import { MovieList } from './components/movie-list/movie-list';
import { TopMoviesComponent } from './components/top-movies/top-movies';


@Component({
  selector: 'app-root',
  imports: [MovieList, TopMoviesComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
  standalone: true,
})

export class App {
}
