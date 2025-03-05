import { Routes } from '@angular/router';
import { NotifyComponent } from './notify/notify.component';
import { HomePageComponent } from './home-page/home-page.component';
import { QrCodePageComponent } from './qr-code-page/qr-code-page.component';
import { provideRouter, withHashLocation } from '@angular/router';
import { AppComponent } from './app.component';
import { UploadKMLComponent } from './upload-kml/upload-kml.component';


export const routes: Routes = [
    { path: 'home', component: HomePageComponent },
    { path: 'home', redirectTo: 'home', pathMatch: 'full' },
    { path: 'notify', component: NotifyComponent },
    { path: 'QrCode', component: QrCodePageComponent },
    {path:'root' ,component:AppComponent},
    {path:'upload' ,component:UploadKMLComponent}

  ];
  
  export const APP_ROUTER = provideRouter(routes, withHashLocation());
  