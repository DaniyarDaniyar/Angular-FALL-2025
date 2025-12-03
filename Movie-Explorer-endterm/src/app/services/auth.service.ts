import { Injectable } from '@angular/core';
import { from, Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
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
    return from(createUserWithEmailAndPassword(this.auth, email, password)).pipe(
      catchError((err) => throwError(() => new Error(this.mapFirebaseError(err))))
    );
  }

  login(email: string, password: string): Observable<any> {
    return from(signInWithEmailAndPassword(this.auth, email, password)).pipe(
      catchError((err) => throwError(() => new Error(this.mapFirebaseError(err))))
    );
  }

  logout(): Observable<void> {
    return from(signOut(this.auth)).pipe(
      catchError((err) => throwError(() => new Error(this.mapFirebaseError(err))))
    );
  }

  private mapFirebaseError(err: any): string {
    const code: string = err?.code || '';
    switch (code) {
      case 'auth/invalid-email':
        return 'Неверный формат email.';
      case 'auth/user-disabled':
        return 'Учётная запись отключена.';
      case 'auth/user-not-found':
        return 'Пользователь не найден.';
      case 'auth/wrong-password':
        return 'Неверный пароль.';
      case 'auth/email-already-in-use':
        return 'Этот email уже используется.';
      case 'auth/weak-password':
        return 'Пароль должен быть не менее 6 символов.';
      case 'auth/too-many-requests':
        return 'Слишком много попыток. Попробуйте позже.';
      case 'auth/network-request-failed':
        return 'Проблемы с сетью. Проверьте подключение.';
      default:
        return err?.message || 'Ошибка аутентификации';
    }
  }
}
