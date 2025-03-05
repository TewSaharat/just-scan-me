import { CommonModule } from '@angular/common';
import { Component} from '@angular/core';
import { RouterModule, RouterOutlet, } from '@angular/router';
import { HomePageComponent } from "./home-page/home-page.component";
import { BodyComponent } from "./body/body.component";

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [ RouterModule, CommonModule, HomePageComponent],
    templateUrl: './app.component.html',
    styleUrl: './app.component.css'
})
export class AppComponent  {



  
  title = 'just-scan-me';
isModalOpen: any;

}
