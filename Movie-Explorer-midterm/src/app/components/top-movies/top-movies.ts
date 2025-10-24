import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface ClassicMovie {
  Title: string;
  Year: number;
  Poster: string;
  Likes: number;
  Comment: string;
}

@Component({
  selector: 'top-movies',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './top-movies.html',
  styleUrls: ['./top-movies.css']
})
export class TopMoviesComponent {
  title = signal('Top 5 Classic Movies');
  movies = signal<ClassicMovie[]>([
    {
      Title: 'The Godfather',
      Year: 1972,
      Poster: 'https://m.media-amazon.com/images/M/MV5BNGEwYjgwOGQtYjg5ZS00Njc1LTk2ZGEtM2QwZWQ2NjdhZTE5XkEyXkFqcGc@._V1_SX300.jpg',
      Likes: 0,
      Comment: ''
    },
    {
      Title: 'The Shawshank Redemption',
      Year: 1994,
      Poster: 'https://m.media-amazon.com/images/M/MV5BMDAyY2FhYjctNDc5OS00MDNlLThiMGUtY2UxYWVkNGY2ZjljXkEyXkFqcGc@._V1_SX300.jpg',
      Likes: 0,
      Comment: ''
    },
    {
      Title: 'Forrest Gump',
      Year: 1994,
      Poster: 'https://m.media-amazon.com/images/M/MV5BNDYwNzVjMTItZmU5YS00YjQ5LTljYjgtMjY2NDVmYWMyNWFmXkEyXkFqcGc@._V1_SX300.jpg',
      Likes: 0,
      Comment: ''
    },
    {
      Title: 'Pulp Fiction',
      Year: 1994,
      Poster: 'https://m.media-amazon.com/images/M/MV5BYTViYTE3ZGQtNDBlMC00ZTAyLTkyODMtZGRiZDg0MjA2YThkXkEyXkFqcGc@._V1_SX300.jpg',
      Likes: 0,
      Comment: ''
    },
    {
      Title: 'Inception',
      Year: 2010,
      Poster: 'https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg',
      Likes: 0,
      Comment: ''
    }
  ]);

  like(movie: ClassicMovie) {
    movie.Likes++;
    // Для обновления интерфейса пересоздаём signal массив
    this.movies.update(m => [...m]);
  }
}
