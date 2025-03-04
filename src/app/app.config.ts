import { ApplicationConfig, NgModule } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { AppComponent } from './app.component';
import { bootstrapApplication } from '@angular/platform-browser';


export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes)]
};
bootstrapApplication(AppComponent, {
  providers: [provideRouter(routes)],
}).catch((err) => console.error(err));

