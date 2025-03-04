import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { EditFormComponent } from '../edit-form/edit-form.component';
import { QrCodePageComponent } from '../qr-code-page/qr-code-page.component';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';
import 'leaflet.markercluster';
import { firstValueFrom, Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { ScrollingModule } from '@angular/cdk/scrolling';
import 'leaflet.fullscreen';

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

  map!: L.Map;
  markers: Marker[] = [];
  markerGroup!: L.LayerGroup;
  private filterChange$ = new Subject<void>();

  constructor(private http: HttpClient, private dialog: MatDialog) {}

  ngOnInit(): void {
    
    this.loadMap();
    setTimeout(() => this.fetchMarkers(), 100);

    // ใช้ debounceTime เพื่อลดการเรียก API ซ้ำซ้อน
    this.filterChange$.pipe(debounceTime(500)).subscribe(() => {
      this.fetchMarkers();
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.filterChange$.next();
  }

  loadMap(): void {
    this.map = L.map('map').setView([17.5656463201181, 104.6081251946405], 13);
  
    // 🗺 Tile Layer: ถนน (Street View)
    const streetLayer = L.tileLayer('https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
      attribution: 'Google Maps',
      maxZoom: 20
    });
  
    // 🛰 Tile Layer: ภาพถ่ายดาวเทียม (Satellite View)
    const satelliteLayer = L.tileLayer('https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
      attribution: 'Google Satellite',
      maxZoom: 20
    });
  
    // ⚙️ Default Layer: เริ่มต้นด้วยแผนที่ถนน
    streetLayer.addTo(this.map);
  
    // 🔘 Layer Control (เลือกแสดง Street หรือ Satellite)
    const baseMaps = {
      "แผนที่ถนน": streetLayer,
      "แผนที่ดาวเทียม": satelliteLayer
    };
    L.control.layers(baseMaps).addTo(this.map);
  
    // 📌 Cluster Markers
    this.markerGroup = L.markerClusterGroup({ disableClusteringAtZoom: 14 });
    this.map.addLayer(this.markerGroup);
  
    // 🔲 Fullscreen Mode
    (L.control as any).fullscreen({ position: 'topright' }).addTo(this.map);
  }
  

  async fetchMarkers(): Promise<void> {
    try {
      const data = await firstValueFrom(this.http.get<Marker[]>('https://just-scan-me-backend.onrender.com/api/routes'));
      if (data) {
        this.markers = data.filter(marker => marker.name_id);
        
        requestIdleCallback(() => {
          this.filterMarkers();
        });
      }
    } catch (error) {
      console.error('Error fetching markers:', error);
    }
  }
  
  filterMarkers(): void {
    if (!this.map || !this.markerGroup) return;
    this.markerGroup.clearLayers();

    const filteredMarkers = this.markers.filter(marker => {
      const categoryMatch = this.selectedCategory === 'all' || marker.cat_id === Number(this.selectedCategory);
      const routeMatch = this.selectedRoute === 'all' || (marker.routes && marker.routes.toString() === this.selectedRoute);
      const statusMatch = (this.showNormal && marker.status === 1) || (this.showFaulty && marker.status === 0);
      return categoryMatch && routeMatch && statusMatch;
    });

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
        .on('popupopen', () => {
          setTimeout(() => {
            this.setupPopupEventListeners(marker);
          }, 500);
        });

      this.markerGroup.addLayer(markerInstance);
    });
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
        หมอเล: <span style="color: ${statusColor};">${statusText}</span><br>
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

      </div>
    </div>
  `;
} 

  private setupPopupEventListeners(marker: Marker): void {
    const editButton = document.querySelector(`.edit-button[data-id="${marker.name_id}"]`);
    if (editButton && !editButton.getAttribute('data-listener')) {
      editButton.setAttribute('data-listener', 'true');
      editButton.addEventListener('click', () => this.openEditForm(marker));
      console.log("คลิกปุ่มแก้ไข:", marker.name_id); // ตรวจสอบว่าปุ่มถูกกดจริงไหม
      // this.openEditForm(marker);
      
    }

    const qrButton = document.querySelector(`.qrcode[data-id="${marker.name_id}"]`);
    if (qrButton && !qrButton.getAttribute('data-listener')) {
      qrButton.setAttribute('data-listener', 'true');
      qrButton.addEventListener('click', () => this.generateQRCode(marker.name_id!));
    }
  }

  openEditForm(marker: Marker): void {
    const dialogRef = this.dialog.open(EditFormComponent, {
      width: '1000px',
      height: '800px',
      data: marker,
      panelClass: 'custom-dialog'
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log("ปิด Dialog", result);
      if (result) {
        this.fetchMarkers();
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
}

