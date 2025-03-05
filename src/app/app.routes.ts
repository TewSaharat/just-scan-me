import { Routes } from '@angular/router';
import { NotifyComponent } from './notify/notify.component';
import { HomePageComponent } from './home-page/home-page.component';
import { QrCodePageComponent } from './qr-code-page/qr-code-page.component';


export const routes: Routes = [
    {path:'home',component:HomePageComponent},
    { path: '', redirectTo: '/home', pathMatch: 'full' },
    {path: 'notify',component:NotifyComponent},
    {path: 'QrCode',component:QrCodePageComponent}
];

