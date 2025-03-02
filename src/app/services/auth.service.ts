import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, } from 'rxjs';
import { tap } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private isLoggedInSubject = new BehaviorSubject<boolean>(this.hasToken());
  private userSubject = new BehaviorSubject<any>(this.getUserFromStorage());
  
  
  isLoggedIn(): Observable<boolean> {
    return this.isLoggedInSubject.asObservable();
  }


  private apiUrl = 'https://just-scan-me-backend.onrender.com/api';
  private isAuthenticated = new BehaviorSubject<boolean>(false);
  private userRole = new BehaviorSubject<string>('user');

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, { email, password }).pipe(
      tap(response => {
        if (response.token) {
          localStorage.setItem('token', response.token);
          this.isAuthenticated.next(true);
          this.getUser().subscribe();
          this.isLoggedInSubject.next(false);
          this.userSubject.next(null);
        }
      })
    );
  }


  logout() {
    console.log("Logging out..."); // ตรวจสอบว่า Logout ถูกเรียกหรือไม่
    this.http.post('https://just-scan-me-backend.onrender.com/api/logout', {}, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    }).subscribe(() => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      this.isLoggedInSubject.next(false);
      this.userSubject.next(null);
      console.log("Logout successful!"); // ตรวจสอบว่าถึงจุดนี้หรือไม่
    }, error => {
      console.error("Logout error:", error);
    });
  }


  getUser(): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.getToken()}`);
    return this.http.get<any>(`${this.apiUrl}/me`, { headers }).pipe(
      tap(user => {
        if (user && user.role) {
          this.userRole.next(user.role);
        }
      })
    );
  }
  

  updateProfile(name: string, email: string): Observable<any> {
    const token = this.getToken();
    return this.http.post(`${this.apiUrl}/update-profile`, { name, email }, {
      headers: new HttpHeaders({ 'Authorization': `Bearer ${token}` })
    });
  }

  saveToken(token: string, user: any) {
    localStorage.setItem('auth_token', token);
    this.isLoggedInSubject.next(true);
    this.userSubject.next(user);
    
  }

  private hasToken(): boolean {
    return !!localStorage.getItem('token');
  }

  private getUserFromStorage(): any {
    return JSON.parse(localStorage.getItem('user') || '{}');
  }

  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }
 
  isAdmin(): boolean {
    return this.userRole.value === 'admin';
  }
}
