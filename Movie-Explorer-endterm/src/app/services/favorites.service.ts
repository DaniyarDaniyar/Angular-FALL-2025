import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, from, combineLatest } from 'rxjs';
import { map, switchMap, tap, first } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { Firestore, doc, setDoc, getDoc, updateDoc, deleteField } from '@angular/fire/firestore';
import { inject } from '@angular/core';

const LOCAL_STORAGE_KEY = 'movie_favorites';

@Injectable({ providedIn: 'root' })
export class FavoritesService {
  private firestore = inject(Firestore);
  private auth = inject(AuthService);
  
  private favoritesSubject = new BehaviorSubject<string[]>([]);
  public favorites$ = this.favoritesSubject.asObservable();

  private hasMerged = false;

  constructor() {
    // Initialize favorites based on auth state
    this.auth.currentUser$.pipe(
      switchMap(user => {
        if (user) {
          // Load from Firestore for logged-in users
          return this.loadFromFirestore(user.uid);
        } else {
          // Load from localStorage for non-logged-in users
          return this.loadFromLocalStorage();
        }
      })
    ).subscribe(favorites => {
      this.favoritesSubject.next(favorites);
    });

    // Listen for login to merge favorites (only once per session)
    this.auth.currentUser$.pipe(
      map(user => user?.uid || null),
      switchMap(async (uid) => {
        if (uid && !this.hasMerged) {
          // Check if there are local favorites to merge
          const localFavorites = this.getLocalFavorites();
          if (localFavorites.length > 0) {
            this.hasMerged = true;
            await this.mergeFavorites(uid, localFavorites);
            return true; // Merge happened
          }
        }
        return false; // No merge needed
      })
    ).subscribe();
  }

  private loadFromLocalStorage(): Observable<string[]> {
    const favorites = this.getLocalFavorites();
    return from([favorites]);
  }

  private getLocalFavorites(): string[] {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private saveToLocalStorage(favorites: string[]): void {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(favorites));
    } catch (error) {
      console.error('Failed to save favorites to localStorage:', error);
    }
  }

  private async loadFromFirestore(uid: string): Promise<string[]> {
    try {
      const userDocRef = doc(this.firestore, 'users', uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const data = userDoc.data();
        return data['favorites'] || [];
      }
      return [];
    } catch (error) {
      console.error('Failed to load favorites from Firestore:', error);
      return [];
    }
  }

  async mergeFavorites(uid: string, localFavorites: string[]): Promise<boolean> {
    try {
      const firestoreFavorites = await this.loadFromFirestore(uid);
      
      // Merge: combine both lists, remove duplicates
      const merged = Array.from(new Set([...firestoreFavorites, ...localFavorites]));
      
      // Only update if there are new items to merge
      if (merged.length > firestoreFavorites.length) {
        // Save merged list to Firestore
        const userDocRef = doc(this.firestore, 'users', uid);
        await setDoc(userDocRef, { favorites: merged }, { merge: true });
        
        // Clear localStorage after merge
        localStorage.removeItem(LOCAL_STORAGE_KEY);
        
        // Update subject
        this.favoritesSubject.next(merged);
        return true; // Merge happened
      }
      return false; // No merge needed
    } catch (error) {
      console.error('Failed to merge favorites:', error);
      return false;
    }
  }

  checkAndMergeOnLogin(uid: string): Promise<boolean> {
    const localFavorites = this.getLocalFavorites();
    if (localFavorites.length > 0 && !this.hasMerged) {
      this.hasMerged = true;
      return this.mergeFavorites(uid, localFavorites);
    }
    return Promise.resolve(false);
  }

  async addFavorite(movieId: string): Promise<void> {
    const currentFavorites = this.favoritesSubject.value;
    
    if (currentFavorites.includes(movieId)) {
      return; // Already in favorites
    }

    const newFavorites = [...currentFavorites, movieId];
    this.favoritesSubject.next(newFavorites);

    // Save to appropriate storage
    const user = await this.auth.currentUser$.pipe(first()).toPromise();
    
    if (user) {
      // Save to Firestore
      try {
        const userDocRef = doc(this.firestore, 'users', user.uid);
        await setDoc(userDocRef, { favorites: newFavorites }, { merge: true });
      } catch (error) {
        console.error('Failed to save favorite to Firestore:', error);
        // Revert on error
        this.favoritesSubject.next(currentFavorites);
      }
    } else {
      // Save to localStorage
      this.saveToLocalStorage(newFavorites);
    }
  }

  async removeFavorite(movieId: string): Promise<void> {
    const currentFavorites = this.favoritesSubject.value;
    const newFavorites = currentFavorites.filter(id => id !== movieId);
    
    this.favoritesSubject.next(newFavorites);

    // Update appropriate storage
    const user = await this.auth.currentUser$.pipe(first()).toPromise();
    
    if (user) {
      // Update Firestore
      try {
        const userDocRef = doc(this.firestore, 'users', user.uid);
        await setDoc(userDocRef, { favorites: newFavorites }, { merge: true });
      } catch (error) {
        console.error('Failed to remove favorite from Firestore:', error);
        // Revert on error
        this.favoritesSubject.next(currentFavorites);
      }
    } else {
      // Update localStorage
      this.saveToLocalStorage(newFavorites);
    }
  }

  isFavorite(movieId: string): Observable<boolean> {
    return this.favorites$.pipe(
      map(favorites => favorites.includes(movieId))
    );
  }

  getFavoritesCount(): Observable<number> {
    return this.favorites$.pipe(
      map(favorites => favorites.length)
    );
  }
}

