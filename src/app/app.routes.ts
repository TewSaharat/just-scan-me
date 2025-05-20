import { Routes } from '@angular/router';
import { NotifyComponent } from './notify/notify.component';
import { HomePageComponent } from './home-page/home-page.component';
import { QrCodePageComponent } from './qr-code-page/qr-code-page.component';
import { KmlUploadComponent } from './kml-upload/kml-upload.component';
import { DownloadComponent } from './download/download.component';
import { UserManagementComponent } from './user-management/user-management.component';


export const routes: Routes = [
    {path:'home',component:HomePageComponent},
    { path: '', redirectTo: 'home', pathMatch: 'full' },
    {path: 'notify',component:NotifyComponent},
    {path: 'QrCode',component:QrCodePageComponent},
    {path:'upload',component:KmlUploadComponent},
    {path: 'download',component:DownloadComponent },
    {path: 'UserManagement', component:UserManagementComponent } // Redirect to home for any unknown routes
];

