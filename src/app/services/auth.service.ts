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
                localStorage.setItem('user', JSON.stringify(response.user));
                
                this.isLoggedInSubject.next(true); // ✅ อัปเดตค่า isLoggedIn
                this.userSubject.next(response.user); // ✅ อัปเดต user
                console.log("User logged in successfully and status updated.");
            }
        })
    );
}



  
  isTokenExpired(): boolean {
    const token = localStorage.getItem('token');
    if (!token) return true; // ถ้าไม่มี Token ถือว่าหมดอายุ

    try {
        const payload = JSON.parse(atob(token.split('.')[1])); // ถอดรหัส Payload ของ JWT
        const exp = payload.exp * 1000; // แปลงวินาทีเป็นมิลลิวินาที
        const now = Date.now();

        return now >= exp; // ถ้าถึงหรือเกินเวลา exp ให้ถือว่าหมดอายุ
    } catch (error) {
        console.error("Invalid Token Format", error);
        return true; // ถ้า Token ผิดพลาด ให้ถือว่าหมดอายุ
    }
}



logout() {
  
  const token = localStorage.getItem('token');

  if (!token || this.isTokenExpired()) {
      console.warn("No valid token found. Clearing session locally.");
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      this.isLoggedInSubject.next(false);
      this.userSubject.next(null);
      return;
  }

  localStorage.removeItem('token');
  localStorage.removeItem('user');
  this.isLoggedInSubject.next(false);
  this.userSubject.next(null);
  console.log("Token removed from LocalStorage!");

  this.http.post('https://just-scan-me-backend.onrender.com/api/logout', {}, {
      headers: { Authorization: `Bearer ${token}` }
  }).subscribe({
      next: () => console.log("Logout successful!"),
      error: (err) => console.warn("Logout API failed (Token might be expired):", err)
  });
}



getUser(): Observable<any> {
  const token = this.getToken();
  if (!token || this.isTokenExpired()) {
    console.warn('No valid token, ไม่เรียก API /me');
    return new Observable(observer => {
      observer.error('No valid token');
    });
  }

  const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
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
