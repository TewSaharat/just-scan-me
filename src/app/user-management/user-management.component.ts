import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterOutlet, RouterModule],
})
export class UserManagementComponent implements OnInit {
  users: any[] = [];
  currentUser: any;
  allowedStatuses = ['user', 'admin', 'viewer', 'Advanced_users']; // สามารถเพิ่ม role อื่นได้ที่นี่

  districtMap: { [key: number]: string } = {
    1: 'หมวดนครพนม',
    2: 'หมวดศรีสงคราม',
    3: 'หมวดปลาปาก',
    4: 'หมวดท่าอุเทน',
    5: 'หมวดนาแก',
  };

  constructor(
    private authService: AuthService,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.checkLoginStatus();
  }

  checkLoginStatus() {
    this.authService.getUser().subscribe(
      (user) => {
        this.currentUser = user;
        if (this.currentUser.role !== 'admin') {
          alert('คุณต้องเป็นผู้ดูแลระบบ (Admin) ถึงจะเข้าถึงหน้านี้ได้');
          this.router.navigate(['/home']);
        } else {
          this.loadUsers();
        }
      },
      () => {
        this.router.navigate(['/login']);
      }
    );
  }

  loadUsers() {
    const token = this.authService.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    this.http
      .get<any[]>('http://127.0.0.1:8000/api/users', { headers })
      .subscribe((data) => {
        this.users = data;
      });
  }

  confirmChange(user: any) {
    if (this.currentUser.role !== 'admin') {
      alert('คุณไม่มีสิทธิ์ในการเปลี่ยนสถานะผู้ใช้งาน');
      return;
    }

    if (!user.newStatus) {
      alert('กรุณาเลือกสถานะ');
      return;
    }

    if (!this.allowedStatuses.includes(user.newStatus)) {
      alert('สถานะไม่ถูกต้อง');
      return;
    }

    // ใช้ setTimeout เพื่อหลีกเลี่ยง block UI ตรง ๆ
    setTimeout(() => {
      const confirmed = window.confirm(
        `คุณต้องการเปลี่ยนสถานะของ ${user.name} เป็น ${user.newStatus} หรือไม่?`
      );
      if (confirmed) {
        const token = this.authService.getToken();
        const headers = new HttpHeaders().set(
          'Authorization',
          `Bearer ${token}`
        );

        // ส่งคำขอ PUT เพื่อเปลี่ยน role
        this.http
          .put(
            `http://127.0.0.1:8000/api/users/${user.id}/role`, // ปรับเส้นทางให้ถูกต้อง
            { role: user.newStatus }, // ส่ง role ที่ต้องการเปลี่ยน
            { headers }
          )
          .subscribe(() => {
            alert('เปลี่ยนสิทธิ์เรียบร้อยแล้ว');
            this.loadUsers(); // รีโหลดข้อมูลผู้ใช้
          });
      }
    }, 0);
  }
}
