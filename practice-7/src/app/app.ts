import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLinkWithHref, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, RouterLinkWithHref, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.css',
  standalone: true,
})

export class App {
  private auth = inject(AuthService);
  private router = inject(Router);
  user$ = this.auth.currentUser$;

  logout() {
    this.auth.logout().subscribe({ next: () => this.router.navigate(['/']) });
  }
}
