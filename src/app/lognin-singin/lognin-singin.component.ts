import { Component, EventEmitter, Output, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'; // ✅ นำเข้า CUSTOM_ELEMENTS_SCHEMA
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-lognin-singin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './lognin-singin.component.html',
  styleUrl: './lognin-singin.component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA] // ✅ เพิ่มตรงนี้
})
export class LogninSinginComponent {
  @Output() close = new EventEmitter<void>();

  isLoginMode = true;
  email: string = '';
  password: string = '';
  isLoggedIn: boolean = false;
  user: any = null;
  loginSuccess = false;
  loginError: boolean = false;
  errorMessage = '';  // เก็บข้อความ error

  constructor(
    private authService: AuthService,
    private router: Router,
    private http: HttpClient
  ) {}

onSubmit() {
  if (this.isLoginMode) {
    this.authService.login(this.email, this.password).subscribe({
      next: (response) => {
        if (response.token) {
          this.authService.saveToken(response.token, response.user);
          this.loginSuccess = true;
          this.loginError = false;
          this.errorMessage = '';

          setTimeout(() => {
            location.reload();
          }, 2000);
        } else {
          this.loginSuccess = false;
          this.loginError = true;
          this.errorMessage = 'Login Failed: Token not received';
        }
      },
      error: (err) => {
        this.loginSuccess = false;
        this.loginError = true;
        this.errorMessage = 'Login Failed: ' + (err.error?.message || 'Unknown error');
      },
    });
  }
}


  logout() {
    const token = localStorage.getItem('token');
    this.http.post('http://127.0.0.1:8000/api/logout', {}, {
      headers: { Authorization: `Bearer ${token}` },
    }).subscribe(() => {
      localStorage.removeItem('token');
      this.isLoggedIn = false;
      this.user = null;
    });

    this.close.emit();
    this.closePopup();
  }

  switchMode() {
    this.isLoginMode = !this.isLoginMode;
  }

  closePopup() {
    this.close.emit();
  }
}
