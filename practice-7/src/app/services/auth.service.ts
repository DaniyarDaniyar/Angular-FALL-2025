import { Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  User,
} from 'firebase/auth';
import { firebaseApp } from '../app.config';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private get auth() {
    return getAuth(firebaseApp);
  }

  get currentUser$(): Observable<User | null> {
    return new Observable((subscriber) => {
      const unsubscribe = onAuthStateChanged(this.auth, (user) => subscriber.next(user), (err) => subscriber.error(err));
      return { unsubscribe };
    });
  }

  signup(email: string, password: string): Observable<any> {
    return from(createUserWithEmailAndPassword(this.auth, email, password));
  }

  login(email: string, password: string): Observable<any> {
    return from(signInWithEmailAndPassword(this.auth, email, password));
  }

  logout(): Observable<void> {
    return from(signOut(this.auth));
  }
}
