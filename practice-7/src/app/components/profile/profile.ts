import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class Profile {
  private auth = inject(AuthService);
  private router = inject(Router);

  user$ = this.auth.currentUser$;

  logout() {
    this.auth.logout().subscribe({ next: () => this.router.navigate(['/login']) });
  }
}
