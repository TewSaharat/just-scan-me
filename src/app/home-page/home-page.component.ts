import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
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
    styleUrls: ['./home-page.component.css']
})
export class HomePageComponent implements OnInit {
    message: string = '';
    isLoggedIn: boolean = false;
    user: any = null;
    isSidebarVisible = false;
    isPopupVisible = false;

    constructor(
        private wsService: WebSocketService,
        private router: Router,
        private authService: AuthService
    ) {}

    ngOnInit() {

        this.authService.isLoggedIn().subscribe((status: boolean) => {
            this.isLoggedIn = status;
        });
    
        this.authService.getUser().subscribe((user: any) => {

            this.user = user;
        });

        const token = localStorage.getItem('token');
        if (!token || this.authService.isTokenExpired()) {
            this.logout(); // ✅ ลบ Token และเปลี่ยน UI
            return;
        }
    
        // ✅ Subscribe เพื่อตรวจสอบสถานะการล็อกอินแบบ Reactive
        this.authService.isLoggedIn().subscribe((status: boolean) => {
            this.isLoggedIn = status;
        });
        // ✅ ดึงข้อมูลผู้ใช้ ถ้าพบ error 401 ให้ logout
        this.authService.getUser().subscribe({
            next: (user: any) => {
                this.user = user;
            },
            error: (err) => {
                console.error("Error fetching user:", err);
                if (err.status === 401) { // ✅ เช็คว่าเป็น Unauthorized ก่อน Logout
                    this.logout();
                }
            }
        });

    }
    

    checkLoginStatus() {
        const token = localStorage.getItem('token');
        
        if (!token || this.authService.isTokenExpired()) {
           
            this.logout();
            return;
        }
    
        this.isLoggedIn = true;
        this.user = JSON.parse(localStorage.getItem('user') || '{}');
    }
    
    

    logout() {
        this.authService.logout();
        this.isPopupVisible = false;
        this.isLoggedIn = false;
        this.user = null;
    }
    

    toggleSidebar() {
        this.isSidebarVisible = !this.isSidebarVisible;
    }
    openPopup() {
        this.isPopupVisible = true;
    }

    closePopup() {
        this.isPopupVisible = false;
    }
}
