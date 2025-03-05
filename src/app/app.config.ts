import { ApplicationConfig } from '@angular/core';
import { provideRouter, withHashLocation } from '@angular/router';
import { routes } from './app.routes';
import { AppComponent } from './app.component';
import { bootstrapApplication } from '@angular/platform-browser';

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes, withHashLocation())] 
};

bootstrapApplication(AppComponent, appConfig).catch((err) => console.error(err));
