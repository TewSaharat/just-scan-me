import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://127.0.0.1:8000/api';
  private isLoggedInSubject = new BehaviorSubject<boolean>(this.hasToken());
  private userSubject = new BehaviorSubject<any>(this.getUserFromStorage());
  private isAuthenticated = new BehaviorSubject<boolean>(false);
  private userRole = new BehaviorSubject<string>('user');
  private userCategory = new BehaviorSubject<string>('all');

  constructor(private http: HttpClient) {
    this.loadUserFromToken();
  }

  login(email: string, password: string): Observable<any> {
    return this.http
      .post<any>(`${this.apiUrl}/login`, { email, password })
      .pipe(
        tap((response) => {
          if (response.token) {
            this.saveToken(response.token, response.user);
            console.log('User logged in successfully and status updated.');
          }
        })
      );
  }

  logout() {
    const token = this.getToken();
    if (!token || this.isTokenExpired()) {
      this.clearSession();
      return;
    }

    this.clearSession(); // Clear local session first

    this.http
      .post(
        `${this.apiUrl}/logout`,
        {},
        {
          headers: new HttpHeaders({ Authorization: `Bearer ${token}` }),
        }
      )
      .subscribe({
        next: () => console.log('Logout successful!'),
        error: (err) =>
          console.warn('Logout API failed (Token might be expired):', err),
      });
  }

  getUser(): Observable<any> {
    const token = this.getToken();
    if (!token || this.isTokenExpired()) {
      return new Observable((observer) => {
        observer.error('No valid token');
      });
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<any>(`${this.apiUrl}/me`, { headers }).pipe(
      tap((user) => {
        if (user && user.role) {
          this.userRole.next(user.role);
        }
      })
    );
  }

  updateProfile(name: string, email: string): Observable<any> {
    const token = this.getToken();
    return this.http.post(
      `${this.apiUrl}/update-profile`,
      { name, email },
      {
        headers: new HttpHeaders({ Authorization: `Bearer ${token}` }),
      }
    );
  }

  // ✅ บันทึก Token และ User อย่างถูกต้อง
  saveToken(token: string, user: any) {
    localStorage.setItem('auth_token', token);
    localStorage.setItem('user', JSON.stringify(user));
    this.isLoggedInSubject.next(true);
    this.userSubject.next(user);
  }

  // ✅ อ่าน Token
  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  // ✅ เช็กว่ามี Token หรือไม่ (ใช้ชื่อที่ถูกต้อง)
  private hasToken(): boolean {
    return !!localStorage.getItem('auth_token');
  }

  // ✅ อ่าน user จาก localStorage
  private getUserFromStorage(): any {
    return JSON.parse(localStorage.getItem('user') || '{}');
  }

  isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) return true;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const exp = payload.exp * 1000;
      return Date.now() >= exp;
    } catch (error) {
      console.error('Invalid Token Format', error);
      return true;
    }
  }

  clearSession() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    this.isLoggedInSubject.next(false);
    this.userSubject.next(null);
  }

  isLoggedIn(): Observable<boolean> {
    return this.isLoggedInSubject.asObservable();
  }

  isAdmin(): boolean {
    return this.userRole.value === 'admin';
  }

  private loadUserFromToken(): void {
    const token = this.getToken();
    if (token && !this.isTokenExpired()) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      this.userCategory.next(payload.Category_code || 'all');
      this.userRole.next(payload.role);
    }
  }
  getUserRole(): Observable<string> {
    return this.userRole.asObservable();
  }

  getUserCategory(): Observable<string> {
    return this.userCategory.asObservable();
  }
}
