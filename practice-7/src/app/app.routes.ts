import { Routes } from '@angular/router';
import { MovieList } from './components/movie-list/movie-list';
import { Home } from './components/home/home';
import { TopMoviesComponent } from './components/top-movies/top-movies';
import { MovieDetail } from './components/movie-detail/movie-detail';
import { Login } from './components/login/login';

export const routes: Routes = [
    {path: '',component: Home, title: 'Home'},
    {path: 'movies/:id', component: MovieDetail, title: 'MovieDetail'},
    {path:'movies', component: MovieList, title: 'MovieList'},
    {path: 'top-movies', component: TopMoviesComponent, title: 'TopMovies'},
    {path: 'login', component: Login, title: 'Login'}
];
