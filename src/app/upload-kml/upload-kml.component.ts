import { Component } from '@angular/core';
import {  Router, RouterModule } from '@angular/router';

@Component({
    selector: 'app-upload-kml',
    standalone:true,
    templateUrl: './upload-kml.component.html',
    styleUrl: './upload-kml.component.css',
    imports: [RouterModule],
})
export class UploadKMLComponent {


        constructor(
            
            private router: Router,
            
        ) {}
}
