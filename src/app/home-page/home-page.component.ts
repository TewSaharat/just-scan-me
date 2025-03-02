import { Component,OnInit  } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { LogninSinginComponent } from '../lognin-singin/lognin-singin.component';
import { WebSocketService } from '../websocket.service';
import { BodyComponent } from "../body/body.component";
import { AuthService } from '../services/auth.service';

@Component({
    selector: 'app-home-page',
    standalone: true,
    imports: [
        CommonModule,
        LogninSinginComponent,
        RouterModule,
        BodyComponent
    ],
    templateUrl: './home-page.component.html',
    styleUrl: './home-page.component.css',
    providers: [HttpClient]
})

export class HomePageComponent implements OnInit  {
message: string = ''; // ตัวแปรเก็บข้อความจาก WebSocket
isLoggedIn: boolean = false;
  user: any = null;

  constructor(private wsService: WebSocketService,private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    // รับข้อมูลการอัพเดทจาก WebSocket

    this.authService.isLoggedIn().subscribe((status: boolean) => {
      console.log("isLoggedIn status:", status); // ตรวจสอบสถานะ
      this.isLoggedIn = status;
    });

    this.authService.getUser().subscribe((user: any) => {
      this.user = user;
    });

    this.authService.getUser().subscribe((user: any) => {
      this.user = user;
    });
    this.wsService.onUpdate((message) => {
      if (message.type === 'update') {
        // แสดงข้อความการอัพเดทใน UI
        this.message = message.message;
      }
    });

    this.checkLoginStatus()

  }


  isSidebarVisible = false; // เริ่มต้นให้ Sidebar 
  isLoginModalOpen = false;
  isSignup = false;

  categories: any[] = [];
  routes: any[] = [];

  isPopupVisible = false;

  checkLoginStatus() {
    const token = localStorage.getItem('token');
    if (token) {
      this.isLoggedIn = true;
      this.user = JSON.parse(localStorage.getItem('user') || '{}');
    }
  }

  logout() {
    console.log("Calling logout()..."); // ตรวจสอบว่าฟังก์ชัน logout ถูกเรียกหรือไม่
    this.authService.logout();
    this.isPopupVisible = false;
  }
  openPopup() {
    this.isPopupVisible = true;
  }

  closePopup() {
    this.isPopupVisible = false;
  }


  toggleSidebar() {
    this.isSidebarVisible = !this.isSidebarVisible;
    
  }
}
