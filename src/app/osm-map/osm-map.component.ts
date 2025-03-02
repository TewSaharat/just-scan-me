// import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
// import { MatDialog } from '@angular/material/dialog';
// import { EditFormComponent } from '../edit-form/edit-form.component';
// import { QrCodePageComponent } from '../qr-code-page/qr-code-page.component';
// import { HttpClient } from '@angular/common/http';

// import * as L from 'leaflet';
// import 'leaflet.markercluster';

// interface Marker {
//   id: string;
//   // latitude: number;
//   longitude: number;
//   lat: number;
//   // lng: number;
//   name_id: string;
//   routes: string;
//   cat_id: number;
//   status: number;
// }

// @Component({
//   selector: 'app-osm-map',
//   templateUrl: './osm-map.component.html',
//   styleUrls: ['./osm-map.component.css'],
//   standalone: true,
//   providers: [HttpClient]
// })
// export class OsmMapComponent implements OnInit, OnChanges {
//   @Input() selectedCategory: string = 'all';
//   @Input() selectedRoute: string = 'all';
//   @Input() showNormal: boolean = true;
//   @Input() showFaulty: boolean = true;

//   map!: L.Map;
//   markers: Marker[] = [];
//   markersCluster!: any;

//   constructor(private http: HttpClient, private dialog: MatDialog) {}

//   ngOnInit(): void {
//     console.log(L); // ตรวจสอบว่า Leaflet โหลดถูกต้อง
//     console.log(L.markerClusterGroup); // ตรวจสอบว่า markerClusterGroup พร้อมใช้งาน
//     setTimeout(() => {
//       this.loadMap();
//       this.fetchMarkers();
//     }, 1500); // ล่าช้า 1 วินาที
//   }

//   ngOnChanges(changes: SimpleChanges): void {
//     if (changes['selectedCategory'] || changes['selectedRoute'] || changes['showNormal'] || changes['showFaulty']) {
//       this.filterMarkers();
//     }
//   }

//   loadMap(): void {
//     this.map = L.map('map').setView([17.5656463201181, 104.6081251946405], 13);
//     L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(this.map);
  
//     this.markersCluster = L.markerClusterGroup({
//       iconCreateFunction: (cluster) => {
//         const count = cluster.getChildCount();
//         return L.divIcon({
//           html: `<div>${count}</div>`,
//           className: 'custom-cluster',
//           iconSize: L.point(40, 40, true),
//         });
//       },
//       disableClusteringAtZoom: 7,
//     });
    
//     this.map.addLayer(this.markersCluster);
//   }

//   fetchMarkers(): void {
//     this.http.get<Marker[]>('https://just-scan-me-backend.onrender.com/api/routes').subscribe(
//       (data: Marker[]) => {
        
//         this.markers = data.filter(marker => marker.name_id !== null && marker.name_id !== undefined);
//         this.filterMarkers();
//       },
//       (error) => {
//         console.error('Error fetching markers:', error);
//       }
//     );
//   }

//   filterMarkers(): void {
//     if (!this.map) return;
//     if (this.markersCluster) this.markersCluster.clearLayers();

//     const filteredMarkers = this.markers.filter(marker => {  
//       const categoryMatch = this.selectedCategory === 'all' || marker.cat_id === Number(this.selectedCategory);
//       const routeMatch = this.selectedRoute === 'all' || (marker.routes && marker.routes.toString() === this.selectedRoute);
//       const statusMatch = (this.showNormal && marker.status === 1) || (this.showFaulty && marker.status === 0);
//       return categoryMatch && routeMatch && statusMatch;
//     });

//     filteredMarkers.forEach(marker => {
//       if (!marker.name_id) return;

//       const iconUrl = this.getDynamicIconUrl(marker);
//       const dynamicIcon = L.icon({
//         iconUrl,
//         iconSize: [30, 40],
//         iconAnchor: [15, 40],
//         popupAnchor: [0, -40],
//       });

//       const popupContent = this.generatePopupContent(marker);
//       const markerInstance = L.marker([marker.lat, marker.longitude], { icon: dynamicIcon })
//         .bindPopup(popupContent)
//         .on('popupopen', () => {
//           this.setupPopupEventListeners(marker);
//         });

//       this.markersCluster.addLayer(markerInstance);
//     });

//     this.map.addLayer(this.markersCluster);
//   }


//   getCategoryName(category: number | string): string {
//     switch (category.toString()) {
//       case '1': return 'หมวดนครพนม';
//       case '2': return 'หมวดศรีสงคราม';
//       case '3': return 'หมวดปลาปาก';
//       case '4': return 'หมวดท่าอุเทน';
//       case '5': return 'หมวดนาแก';
//       default: return 'ไม่ทราบหมวด';
//     }
//   }
  

//   private getDynamicIconUrl(marker: Marker): string {
//     const nameId = marker.name_id ? marker.name_id.toLowerCase() : '';

//     if (marker.status === 1) {
//       return marker.name_id.toLowerCase().includes('db') ? 'assets/db-on-32.png' : 'assets/sg-on-32.png' ;
//     } else {
//       return marker.name_id.toLowerCase().includes('db') ? 'assets/db-off-32.png' : 'assets/sg-off-32.png';
//     }
//   }

//   private generatePopupContent(marker: Marker): string {
//     const statusText = marker.status === 1 ? 'ปกติ' : 'เสีย'; // Dynamic status text
//     const statusColor = marker.status === 1 ? 'green' : 'red'; // Dynamic status color
//     const categoryName = this.getCategoryName(marker.cat_id);
  
//     return `
//       <div style="font-family: Arial, sans-serif; font-size: 14px;">
//         <div style="font-weight: bold; font-size: 16px; color: #003366;">
//           ${marker.name_id}
//         </div>
//         <div>สถานะ: <span style="color: ${statusColor};">${statusText}</span></div>
//         <div>ผู้ดูแล: ${categoryName}</div>
//         <div>ชนิดของหมวดไฟ:HPS</div>
//         <div>วันที่ก่อสร้าง: </div>
//         <div>สัญญาที่:</div>
//         <hr>
//         <div>
//           สถานะอุปกรณ์:<br>
//           หมอเล: <span style="color: ${statusColor};">${statusText}</span><br>
//           บัลลาสต์: <span style="color: ${statusColor};">${statusText}</span><br>
//           คาปาซิเตอร์: <span style="color: ${statusColor};">${statusText}</span><br>
//           ฟิวส์/กล่อง: <span style="color: ${statusColor};">${statusText}</span>
//         </div>
//         <div style="margin-top: 10px; display: flex; justify-content: center; align-items: center;">
//           <button class="edit-button" data-id="${marker.name_id}" 
//             style="
//               background-color:rgb(0, 204, 44); 
//               color: white; 
//               border: none; 
//               padding: 5px 10px; 
//               border-radius: 5px; 
//               cursor: pointer;">
//             แก้ไข
//           </button>
//               <button class="qrcode" data-id="${marker.name_id}" 
//             style="
//               background-color:rgb(0, 105, 204); 
//               color: white; 
//               border: none; 
//               padding: 5px 10px; 
//               margin: 15px;
//               border-radius: 5px; 
//               cursor: pointer;">
//             พิมพ์ QRCode
//           </button>

//         </div>
//       </div>
//     `;
//   } 


//   private setupPopupEventListeners(marker: Marker): void {
//     const editButton = document.querySelector(`.edit-button[data-id="${marker.name_id}"]`);
//     if (editButton && !editButton.classList.contains('listener-added')) {
//       editButton.classList.add('listener-added');
//       editButton.addEventListener('click', () => this.openEditForm(marker));
//     }

//     const qrButton = document.querySelector(`.qrcode[data-id="${marker.name_id}"]`);
//     if (qrButton && !qrButton.classList.contains('listener-added')) {
//       qrButton.classList.add('listener-added');
//       qrButton.addEventListener('click', () => this.generateQRCode(marker.name_id!));
//     }
//   }



//   openEditForm(marker: Marker): void {
//     const dialogRef = this.dialog.open(EditFormComponent, {
//       width: '4000px',
//       height: '700px',
//       data: marker, // ส่งข้อมูลไอคอนที่มี name_id ไปยัง EditForm
      
//     });

//     dialogRef.afterClosed().subscribe(result => {
//       if (result) {
//         this.fetchMarkers(); // Reload markers after editing
//       }
//     });
//   }

//   generateQRCode(name_id: string): void {
//     const dialogRef = this.dialog.open(QrCodePageComponent, {
//       data: { name_id },  // ส่งค่า ไปยัง dialog
//       width: '1000px',  // กำหนดขนาดของ dialog
//       height: '600px',
//     });
  
//     dialogRef.afterClosed().subscribe(result => {
//       // เมื่อปิด QR Code dialog สามารถเปิด Edit Form ได้ตามต้องการ
//       if (result && result.openEditForm) {
//         const selectedMarker = this.markers.find(m => m.name_id === name_id);
//         if (selectedMarker) {
//           this.openEditForm(selectedMarker);
//         }
//       }
//     });
//   }
  
//   // showPopupFromRow(latitude: number, longitude: number, marker: Marker, zoom:number): void {
//   //   this.map.setView([latitude, longitude],5  ); 
  
//   //   // สร้าง popup content
//   //   const popupContent = this.generatePopupContent(marker);
  
//   //   // ตรวจสอบว่ามีมาร์กเกอร์อยู่แล้วหรือไม่
//   //   const existingMarker = L.marker([latitude, longitude], {
//   //     icon: L.icon({
//   //       iconUrl: this.getDynamicIconUrl(marker),
//   //       iconSize: [30, 40],
//   //       iconAnchor: [15, 40],
//   //       popupAnchor: [0, -40], 
//   //     }),
//   //   });
  
//   //   // ผูกป๊อปอัพกับมาร์กเกอร์และเปิด
//   //   existingMarker.bindPopup(popupContent).openPopup();
  
//   //   // เพิ่มมาร์กเกอร์ลงในแผนที่
//   //   existingMarker.addTo(this.map);
//   // }
  
// }


import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { EditFormComponent } from '../edit-form/edit-form.component';
import { QrCodePageComponent } from '../qr-code-page/qr-code-page.component';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

import * as L from 'leaflet';

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
  imports: [CommonModule, HttpClientModule],
  providers: [HttpClient],
})
export class OsmMapComponent implements OnInit, OnChanges {
  @Input() selectedCategory: string = 'all';
  @Input() selectedRoute: string = 'all';
  @Input() showNormal: boolean = true;
  @Input() showFaulty: boolean = true;

  map!: L.Map;
  markers: Marker[] = [];
  markerGroup!: L.LayerGroup; // ใช้ LayerGroup แทน MarkerClusterGroup

  constructor(private http: HttpClient, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.loadMap();
    this.fetchMarkers();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedCategory'] || changes['selectedRoute'] || changes['showNormal'] || changes['showFaulty']) {
      this.filterMarkers();
    }
  }

  loadMap(): void {
    this.map = L.map('map').setView([17.5656463201181, 104.6081251946405], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(this.map);

    // สร้าง LayerGroup สำหรับ Marker
    this.markerGroup = L.layerGroup().addTo(this.map);
  }

  fetchMarkers(): void {
    this.http.get<Marker[]>('https://just-scan-me-backend.onrender.com/api/routes').subscribe(
      (data: Marker[]) => {
        this.markers = data.filter(marker => marker.name_id !== null && marker.name_id !== undefined);
        this.filterMarkers();
      },
      (error) => {
        console.error('Error fetching markers:', error);
      }
    );
  }

  filterMarkers(): void {
    if (!this.map || !this.markerGroup) return;

    // ลบ Marker ทั้งหมดออกจาก LayerGroup
    this.markerGroup.clearLayers();

    // กรอง Marker ตามเงื่อนไข
    const filteredMarkers = this.markers.filter(marker => {
      const categoryMatch = this.selectedCategory === 'all' || marker.cat_id === Number(this.selectedCategory);
      const routeMatch = this.selectedRoute === 'all' || (marker.routes && marker.routes.toString() === this.selectedRoute);
      const statusMatch = (this.showNormal && marker.status === 1) || (this.showFaulty && marker.status === 0);
      return categoryMatch && routeMatch && statusMatch;
    });

    // เพิ่ม Marker ที่กรองแล้วลงใน LayerGroup
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
          this.setupPopupEventListeners(marker);
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
    const nameId = marker.name_id ? marker.name_id.toLowerCase() : '';

    if (marker.status === 1) {
      return marker.name_id.toLowerCase().includes('db') ? 'assets/db-on-32.png' : 'assets/sg-on-32.png';
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
        <div>ชนิดของหมวดไฟ: HPS</div>
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
              background-color: rgb(0, 204, 44); 
              color: white; 
              border: none; 
              padding: 5px 10px; 
              border-radius: 5px; 
              cursor: pointer;">
            แก้ไข
          </button>
          <button class="qrcode" data-id="${marker.name_id}" 
            style="
              background-color: rgb(0, 105, 204); 
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
    if (editButton && !editButton.classList.contains('listener-added')) {
      editButton.classList.add('listener-added');
      editButton.addEventListener('click', () => this.openEditForm(marker));
    }

    const qrButton = document.querySelector(`.qrcode[data-id="${marker.name_id}"]`);
    if (qrButton && !qrButton.classList.contains('listener-added')) {
      qrButton.classList.add('listener-added');
      qrButton.addEventListener('click', () => this.generateQRCode(marker.name_id!));
    }
  }

  openEditForm(marker: Marker): void {
    const dialogRef = this.dialog.open(EditFormComponent, {
      width: '4000px',
      height: '700px',
      data: marker,
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.fetchMarkers(); // Reload markers after editing
      }
    });
  }

  generateQRCode(name_id: string): void {
    const dialogRef = this.dialog.open(QrCodePageComponent, {
      data: { name_id },
      width: '1000px',
      height: '600px',
      
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