import { Component, signal } from '@angular/core';
import { RouterOutlet, RouterLinkWithHref, RouterLinkActive } from '@angular/router';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLinkWithHref, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.css',
  standalone: true,
})

export class App {
}
