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
            console.log("isLoggedIn status:", status);
            this.isLoggedIn = status;
            
        });

        this.authService.getUser().subscribe((user: any) => {
            this.user = user;
        });

        this.wsService.onUpdate((message) => {
            if (message.type === 'update') {
                this.message = message.message;
            }
        });

        this.checkLoginStatus();
        
    }

    checkLoginStatus() {
        const token = localStorage.getItem('token');
        if (token) {
            this.isLoggedIn = true;
            this.user = JSON.parse(localStorage.getItem('user') || '{}');
        }
    }

    logout() {
        console.log("Calling logout()...");
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
