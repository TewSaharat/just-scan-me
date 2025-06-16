import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-body-light',
  standalone: true,
  templateUrl: './body-light.component.html',
  styleUrls: ['./body-light.component.css']
})
export class BodyLightComponent {
  @Input() totalMarkers: number = 0;
  @Input() totalDB: number = 0; // รับค่าจำนวน DB
  @Input() totalSG: number = 0; // รับค่าจำนวน SG
  @Input() totalRT: number = 0; // จำนวน RT
  @Input() totalFaultyDB: number = 0;
  @Input() totalFaultySG: number = 0;
  @Input() totalFaulty: number = 0;
  
  get faultyBulbs(): number {
   
    return (this.totalFaultyDB * 2) + this.totalFaultySG;

}

}
