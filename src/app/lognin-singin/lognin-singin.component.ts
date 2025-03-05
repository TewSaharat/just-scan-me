import { Component, EventEmitter, Output,} from '@angular/core';
import { CommonModule } from '@angular/common'; // เพิ่ม CommonModule
import { AuthService } from '../services/auth.service';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
    selector: 'app-lognin-singin',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './lognin-singin.component.html',
    styleUrl: './lognin-singin.component.css'
})
export class LogninSinginComponent {
  @Output() close = new EventEmitter<void>();

  isLoginMode = true; // ใช้ควบคุมโหมด Login/Signup
  email: string = '';
  password: string = '';
  isLoggedIn: boolean = false;
  user: any = null;

  constructor(private authService: AuthService, private router: Router,private http: HttpClient) {}

  onSubmit() {
    if (this.isLoginMode) {
      this.authService.login(this.email, this.password).subscribe({
        next: (response) => {
          if (response.token) {
            this.authService.saveToken(response.token, response.user);
            alert('Login Successful');
            this.close.emit(); // ปิด popup
          } else {
            alert('Login Failed: Token not received');
          }
        },
        error: (err) => {
          alert('Login Failed: ' + (err.error?.message || 'Unknown error'));
        }
      });
    }
  }
  
  logout() {
    const token = localStorage.getItem('token');
    this.http.post('https://just-scan-me-backend.onrender.com/api/logout', {}, {
      headers: { Authorization: `Bearer ${token}` }
      
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