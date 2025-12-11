import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLinkWithHref, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';
import { ProfileService } from './services/profile.service';
import { Router } from '@angular/router';
import { switchMap, map } from 'rxjs/operators';
import { of } from 'rxjs';


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
  private profileService = inject(ProfileService);
  
  user$ = this.auth.currentUser$;
  profilePictureUrl$ = this.auth.currentUser$.pipe(
    switchMap(user => {
      if (user) {
        return this.profileService.getProfile(user.uid).pipe(
          map(profile => profile?.profilePictureUrl || null)
        );
      }
      return of(null);
    })
  );

  logout() {
    this.auth.logout().subscribe({ next: () => {
        // Ask credential manager to avoid silent sign-in where supported
        try {
          if (navigator?.credentials?.preventSilentAccess) {
            navigator.credentials.preventSilentAccess();
          }
        } catch {}
        // notify other components to clear any sensitive fields
        window.dispatchEvent(new CustomEvent('user-logged-out'));
        this.router.navigate(['/']);
      }
    });
  }
}
