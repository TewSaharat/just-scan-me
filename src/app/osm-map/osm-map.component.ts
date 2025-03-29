import { Component, OnInit, Input, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { EditFormComponent } from '../edit-form/edit-form.component';
import { QrCodePageComponent } from '../qr-code-page/qr-code-page.component';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

import * as L from 'leaflet';

let MarkerCluster: any;

import { firstValueFrom, Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { ScrollingModule } from '@angular/cdk/scrolling';


interface Marker {
  id: string;
  longitude: number;
  lat: number;
  name_id: string;
  routes: string;
  cat_id: number;
  status: number;
}

@Component({
  selector: 'app-osm-map',
  templateUrl: './osm-map.component.html',
  styleUrls: ['./osm-map.component.css'],
  standalone: true,
  imports:[MatDialogModule,CommonModule, ScrollingModule],
})
export class OsmMapComponent implements OnInit, OnChanges {
  @Input() selectedCategory: string = 'all';
  @Input() selectedRoute: string = 'all';
  @Input() showNormal: boolean = true;
  @Input() showFaulty: boolean = true;
  @Output() dataUpdated = new EventEmitter<void>();
  isLoading: boolean = false;

  map!: L.Map;
  markers: Marker[] = [];
  markerGroup!: L.LayerGroup;
  private filterChange$ = new Subject<void>();

  constructor(private http: HttpClient, private dialog: MatDialog) {}

  async ngOnInit(): Promise<void> {
    // ✅ โหลด MarkerCluster ตอน runtime
    const markerClusterModule = await import('leaflet.markercluster');
    MarkerCluster = markerClusterModule.default ?? markerClusterModule;
    this.loadMap();
    setTimeout(() => this.fetchMarkers(), 100);

    this.filterChange$.pipe(debounceTime(300)).subscribe(() => {
      this.fetchMarkers();
    });
    
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedCategory']?.previousValue !== changes['selectedCategory']?.currentValue ||
        changes['selectedRoute']?.previousValue !== changes['selectedRoute']?.currentValue ||
        changes['showNormal']?.previousValue !== changes['showNormal']?.currentValue ||
        changes['showFaulty']?.previousValue !== changes['showFaulty']?.currentValue) {
      this.filterMarkers();
    }
  }
  


  loadMap(): void {
    this.map = L.map('map').setView([17.5656463201181, 104.6081251946405], 12);
  
    const streetLayer = L.tileLayer('https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
      attribution: 'Google Maps',
      maxZoom: 20,
    });
  
    const satelliteLayer = L.tileLayer('https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
      attribution: 'Google Satellite',
      maxZoom: 20,
    });
  
    streetLayer.addTo(this.map);
  
    L.control.layers(
      {
        'แผนที่ถนน': streetLayer,
        'แผนที่ดาวเทียม': satelliteLayer,
      },
      {}
    ).addTo(this.map);
  
    // ✅ ใช้ `MarkerCluster.MarkerClusterGroup()` แทน `L.markerClusterGroup()`
    this.markerGroup = new MarkerCluster.MarkerClusterGroup({
      disableClusteringAtZoom: 8,
      chunkedLoading: true,
      removeOutsideVisibleBounds: true,
    });
    
  
    this.map.addLayer(this.markerGroup);
    

  }
  
  

  async fetchMarkers(): Promise<void> {
    this.isLoading = true;
    try {
      const bounds = this.map.getBounds();
      const data = await firstValueFrom(this.http.get<Marker[]>(
        `https://just-scan-me-backend.onrender.com/api/routes?bounds=${bounds.getSouth()},${bounds.getWest()},${bounds.getNorth()},${bounds.getEast()}`
      ));
      
      if (data) {
        this.markers = data.filter(marker => marker.lat !== null && marker.longitude !== null);
        this.filterMarkers();
      }
    } catch (error) {
      console.error('Error fetching markers:', error);
    }finally {
      this.isLoading = false; // โหลดเสร็จ
    }
  }
  
  
  filterMarkers(): void {

    if (!this.map || !this.markerGroup) return;
    if (this.markerGroup) {
    this.markerGroup.clearLayers();
    }

    const filteredMarkers = this.markers.filter(marker => {
    const categoryMatch = this.selectedCategory === 'all' || marker.cat_id === Number(this.selectedCategory);
    const routeMatch = this.selectedRoute === 'all' || (marker.routes && marker.routes.toString() === this.selectedRoute);
    const statusMatch =(this.showNormal && marker.status === 1) || (this.showFaulty && marker.status === 0);
      return marker.lat !== null && marker.longitude !== null , categoryMatch && routeMatch && statusMatch ;  
    });

    setTimeout(() => {
        filteredMarkers.forEach(marker => {
            if (!marker.name_id) return;
            const iconUrl = this.getDynamicIconUrl(marker);
            const dynamicIcon = L.icon({
                iconUrl,
                iconSize: [30, 40],
                iconAnchor: [15, 40],
                popupAnchor: [0, -40],
            });

            const popupContent = this.generatePopupContent(marker);
            const markerInstance = L.marker([marker.lat, marker.longitude], { icon: dynamicIcon })
                .bindPopup(popupContent)
                .on("popupopen", () => {
                    setTimeout(() => this.setupPopupEventListeners(marker), 500);
                });

            this.markerGroup.addLayer(markerInstance);
        });

        console.log(`Added ${filteredMarkers.length} markers to the map.`);
    }, 100);
}


  getCategoryName(category: number | string): string {
    switch (category.toString()) {
      case '1': return 'หมวดนครพนม';
      case '2': return 'หมวดศรีสงคราม';
      case '3': return 'หมวดปลาปาก';
      case '4': return 'หมวดท่าอุเทน';
      case '5': return 'หมวดนาแก';
      default: return 'ไม่ทราบหมวด';
    }
  }


  private getDynamicIconUrl(marker: Marker): string {


    if (marker.status === 1) {
      return marker.name_id.toLowerCase().includes('db') ? 'assets/db-on-32.png' : 'assets/sg-on-32.png' ;
    } else {
      return marker.name_id.toLowerCase().includes('db') ? 'assets/db-off-32.png' : 'assets/sg-off-32.png';
    }
  }
  private generatePopupContent(marker: Marker): string {
    const statusText = marker.status === 1 ? 'ปกติ' : 'เสีย';
    const statusColor = marker.status === 1 ? 'green' : 'red';
    const categoryName = this.getCategoryName(marker.cat_id);

    return `
    <div style="font-family: Arial, sans-serif; font-size: 14px;">
      <div style="font-weight: bold; font-size: 16px; color: #003366;">
        ${marker.name_id}
      </div>
      <div>สถานะ: <span style="color: ${statusColor};">${statusText}</span></div>
      <div>ผู้ดูแล: ${categoryName}</div>
      <div>ชนิดของหมวดไฟ:HPS</div>
      <div>วันที่ก่อสร้าง: </div>
      <div>สัญญาที่:</div>
      <hr>
      <div>
        สถานะอุปกรณ์:<br>
        หลอด: <span style="color: ${statusColor};">${statusText}</span><br>
        บัลลาสต์: <span style="color: ${statusColor};">${statusText}</span><br>
        คาปาซิเตอร์: <span style="color: ${statusColor};">${statusText}</span><br>
        ฟิวส์/กล่อง: <span style="color: ${statusColor};">${statusText}</span>
      </div>
      <div style="margin-top: 10px; display: flex; justify-content: center; align-items: center;">
        <button class="edit-button" data-id="${marker.name_id}" 
          style="
            background-color:rgb(0, 204, 44); 
            color: white; 
            border: none; 
            padding: 5px 10px; 
            border-radius: 5px; 
            cursor: pointer;">
          แก้ไข
        </button>
            <button class="qrcode" data-id="${marker.name_id}" 
          style="
            background-color:rgb(0, 105, 204); 
            color: white; 
            border: none; 
            padding: 5px 10px; 
            margin: 15px;
            border-radius: 5px; 
            cursor: pointer;">
          พิมพ์ QRCode
        </button>
        <button onclick="window.open('https://www.google.com/maps?q=&layer=c&cbll=${marker.lat},${marker.longitude}')" 
          style="background-color:#ff9800; color: white; border: none; padding: 5px 10px; margin-top: 5px; border-radius: 5px; cursor: pointer;">
          เปิด Street View
        </button>
      </div>
    </div>
  `;
} 

  private setupPopupEventListeners(marker: Marker): void {
    const editButton = document.querySelector(`.edit-button[data-id="${marker.name_id}"]`);
    if (editButton && !editButton.getAttribute('data-listener')) {
      editButton.setAttribute('data-listener', 'true');
      editButton.addEventListener('click', () => this.openEditForm(marker));
      
    }

    const qrButton = document.querySelector(`.qrcode[data-id="${marker.name_id}"]`);
    if (qrButton && !qrButton.getAttribute('data-listener')) {
      qrButton.setAttribute('data-listener', 'true');
      qrButton.addEventListener('click', () => this.generateQRCode(marker.name_id!));
    }
  }

  openEditForm(marker: Marker): void {
    const dialogRef = this.dialog.open(EditFormComponent, {
      data: marker,
      panelClass: 'custom-dialog',
      width: '500px',
      height: '500px',
      

    });

    dialogRef.afterClosed().subscribe(result => {
      console.log("ปิด Dialog", result);
      if (result) {
        this.fetchMarkers();
        this.dataUpdated.emit();
      }
    });
  }

  generateQRCode(name_id: string): void {
    const dialogRef = this.dialog.open(QrCodePageComponent, {
      data: { name_id },
      width: '500px',
      height: '500px',
      panelClass: 'custom-dialog'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.openEditForm) {
        const selectedMarker = this.markers.find(m => m.name_id === name_id);
        if (selectedMarker) {
          this.openEditForm(selectedMarker);
        }
      }
    });
  } 

 // ✅ เพิ่มฟังก์ชันให้ BodyComponent ใช้ดึง markerGroup
 getMarkerGroup(): L.LayerGroup {
  return this.markerGroup;
}

}