import { Routes } from '@angular/router';
import { NotifyComponent } from './notify/notify.component';
import { HomePageComponent } from './home-page/home-page.component';
import { QrCodePageComponent } from './qr-code-page/qr-code-page.component';
import { provideRouter, withHashLocation } from '@angular/router';
import { ApplicationConfig } from '@angular/core';
import { UploadKMLComponent } from './upload-kml/upload-kml.component';


export const routes: Routes = [
  { path: 'home', component: HomePageComponent },
  { path: '', redirectTo: 'home', pathMatch: 'full' }, // ✅ Redirect ไปหน้า Home
  { path: '**', redirectTo: '/' }, // ✅ ถ้าไม่พบเส้นทาง ให้กลับไปที่ Home
    { path: 'notify', component: NotifyComponent },
    { path: 'QrCode', component: QrCodePageComponent },
    { path: 'upload', component: UploadKMLComponent }

  ];
  
  export const APP_ROUTER = provideRouter(routes, withHashLocation());
  export const appConfig: ApplicationConfig = {
    providers: [provideRouter(routes, withHashLocation())] // ✅ ใช้ Hash Location
  };
  