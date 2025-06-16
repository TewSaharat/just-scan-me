import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent {
  registerForm = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    birthdate_thai: ['', Validators.required],
    Category_code: ['', Validators.required],
  });

  constructor(private fb: FormBuilder, private http: HttpClient) {}

  onSubmit() {
    if (this.registerForm.invalid) return;

    const formValue = this.registerForm.value;
    const birthdate = new Date(formValue.birthdate_thai!);
    const christianYear = birthdate.getFullYear() - 543;
    const convertedBirthdate = `${christianYear}-${(birthdate.getMonth() + 1)
      .toString()
      .padStart(2, '0')}-${birthdate.getDate().toString().padStart(2, '0')}`;

    const payload = {
      ...formValue,
      birthdate_thai: convertedBirthdate,
    };

    this.http
      .post('https://just-scan-me-backend.onrender.com/api/register', payload)
      .subscribe({
        next: (res) => alert('สมัครสมาชิกสำเร็จ'),
        error: (err) => alert('เกิดข้อผิดพลาดในการสมัครสมาชิก'),
      });
  }
}
