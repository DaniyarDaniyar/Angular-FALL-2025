import { Component, inject, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ProfileService, UserProfile } from '../../services/profile.service';
import { combineLatest, BehaviorSubject, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class Profile implements OnDestroy {
  private auth = inject(AuthService);
  private router = inject(Router);
  private profileService = inject(ProfileService);
  private refreshTrigger = new BehaviorSubject<void>(undefined);

  user$ = this.auth.currentUser$;
  profile$ = combineLatest([this.auth.currentUser$, this.refreshTrigger]).pipe(
    switchMap(([user]) => {
      if (user) {
        // User is logged in, fetch the profile
        return this.profileService.getProfile(user.uid);
      }
      return of(null); 
    })
  );

  uploading = signal<boolean>(false);
  uploadError = signal<string | null>(null);
  uploadSuccess = signal<string | null>(null);
  private worker: Worker | null = null;

  ngOnDestroy(): void {
    if (this.worker) {
      this.worker.terminate();
    }
  }

  async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    
    if (!file) return;

    // Validate file type
    if (!file.type.match(/^image\/(jpeg|jpg|png)$/)) {
      this.uploadError.set('Пожалуйста, выберите изображение в формате JPG или PNG');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      this.uploadError.set('Размер файла не должен превышать 10MB');
      return;
    }

    this.uploading.set(true);
    this.uploadError.set(null);
    this.uploadSuccess.set(null);

    try {
      // Create worker for compression
      this.worker = new Worker(
        new URL('../../workers/image-compressor.worker', import.meta.url),
        { type: 'module' }
      );

      const compressedFile = await this.compressImage(file);

      // Get current user
      const user = await this.auth.currentUser$.pipe(
        map(u => u),
        switchMap(u => u ? [u] : [])
      ).toPromise();

      if (!user) {
        throw new Error('Пользователь не авторизован');
      }

      // Upload to Firebase Storage
      const downloadURL = await this.profileService.uploadProfilePicture(compressedFile, user.uid);
      
      this.uploadSuccess.set('Фото профиля успешно загружено!');
      this.uploadError.set(null);
      
      // Refresh profile to show new picture
      this.refreshTrigger.next();
      
      // Clear success message after 5 seconds
      setTimeout(() => this.uploadSuccess.set(null), 5000);
    } catch (error: any) {
      console.error('Error uploading profile picture:', error);
      this.uploadError.set(error?.message || 'Ошибка при загрузке фото профиля');
      this.uploadSuccess.set(null);
    } finally {
      this.uploading.set(false);
      if (this.worker) {
        this.worker.terminate();
        this.worker = null;
      }
      // Reset input
      input.value = '';
    }
  }

  private compressImage(file: File): Promise<File> {
    return new Promise((resolve, reject) => {
      if (!this.worker) {
        reject(new Error('Worker not initialized'));
        return;
      }

      this.worker.onmessage = (e: MessageEvent) => {
        if (e.data.error) {
          reject(new Error(e.data.error));
          return;
        }

        const { blob } = e.data;
        const compressedFile = new File([blob], file.name, {
          type: file.type,
          lastModified: Date.now()
        });
        resolve(compressedFile);
      };

      this.worker.onerror = (error) => {
        reject(error);
      };

      this.worker.postMessage({
        file: file,
        maxWidth: 800,
        quality: 0.8
      });
    });
  }

  logout() {
    this.auth.logout().subscribe({ next: () => this.router.navigate(['/login']) });
  }
}
