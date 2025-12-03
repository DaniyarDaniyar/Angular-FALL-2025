
import { Component, inject, ChangeDetectorRef, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
  standalone: true,
})
export class Login implements OnInit, OnDestroy {
  private auth = inject(AuthService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  email = '';
  password = '';
  loading = false;
  error: string | null = null;
  private _logoutHandler = () => {
    this.email = '';
    this.password = '';
    this.error = null;
    this.loading = false;
    this.cdr.detectChanges();
  };

  submit() {
    this.loading = true;
    this.error = null;
    this.auth.login(this.email, this.password).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/profile']);
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.message || 'Login failed';
        this.cdr.detectChanges();
        window.dispatchEvent(new CustomEvent('user-logged-out'));
      }
    });
  }

  ngOnInit(): void {
    window.addEventListener('user-logged-out', this._logoutHandler as EventListener);
  }

  ngOnDestroy(): void {
    window.removeEventListener('user-logged-out', this._logoutHandler as EventListener);
  }
}
