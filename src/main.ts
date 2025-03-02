import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideHttpClient } from '@angular/common/http';
import { HttpClientModule } from '@angular/common/http';
import { MatDialogModule } from '@angular/material/dialog';
import { routes } from './app/app.routes';
import { provideRouter, RouterModule } from '@angular/router';

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(), 
    HttpClientModule, 
    MatDialogModule, 
    provideRouter(routes),
  ]
}).catch(err => console.error(err));
