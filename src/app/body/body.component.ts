import { Component, OnInit, OnDestroy, viewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { WebSocketService } from '../websocket.service'; // นำเข้า WebSocketService
import { OsmMapComponent } from '../osm-map/osm-map.component';
import { BodyLightComponent } from '../body-light/body-light.component';
import { CommonModule } from '@angular/common';
import L from 'leaflet';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ViewChild } from '@angular/core';

@Component({
    selector: 'app-body',
    standalone: true,
    imports: [OsmMapComponent, BodyLightComponent, CommonModule,],
    templateUrl: './body.component.html',
    styleUrls: ['./body.component.css']
})
export class BodyComponent implements OnInit, OnDestroy {
  @ViewChild(OsmMapComponent, { static: false }) osmMapComponent!: OsmMapComponent;
  
  constructor(private http: HttpClient, private wsService: WebSocketService,private dialog: MatDialog) {}

  selectedDistrict: string = 'all'; // ค่าเริ่มต้นแสดงทุกเขต
  showNormal: boolean = true; // ควบคุมการแสดงสถานะปกติ
  showFaulty: boolean = true; // ควบคุมการแสดงสถานะเสีย

  selectedCategory: string = 'all';
  selectedRoute: string = 'all';
  filteredRoutesData: any[] = []; // สำหรับข้อมูลที่กรองเฉพาะ status = 0

  routesData: any[] = [];
  private ws: WebSocket | null = null;

  totalMarkers: number = 0; // จำนวน Marker ทั้งหมด
  totalDB: number = 0; // จำนวน DB
  totalSG: number = 0; // จำนวน SG
  totalFaulty: number = 0; // จำนวน Marker ที่เสียทั้งหมด
  totalFaultyDB: number = 0; // จำนวน DB ที่เสีย
  totalFaultySG: number = 0; // จำนวน SG ที่เสีย

 

  ngOnInit() {
    
    // ฟังการอัพเดทข้อมูลเมื่อได้รับจาก WebSocket
    this.wsService.onUpdate((message) => {
      if (message.type === 'update') {
        this.fetchRoutes(); // รีเฟรชข้อมูลเมื่อได้รับการอัพเดทจาก WebSocket
      }
    });

    // ดึงข้อมูลเริ่มต้นทันทีที่โหลดคอมโพเนนต์
    this.fetchFilteredRoutes();
    this.fetchRoutes();
  }

  ngOnDestroy() {
    // ปิดการเชื่อมต่อ WebSocket เมื่อคอมโพเนนต์ถูกทำลาย
    this.wsService.disconnect();
  }

  onSelectCategory(event: any) {
    this.selectedCategory = event.target.value;
    this.fetchFilteredRoutes();
  }

  onSelectRoute(event: any) {
    this.selectedRoute = event.target.value;
    this.fetchFilteredRoutes();
  }

  toggleNormal(): void {
    this.showNormal = !this.showNormal;
    this.fetchFilteredRoutes();
  }

  toggleFaulty(): void {
    this.showFaulty = !this.showFaulty;
    this.fetchFilteredRoutes();
  }

  onSelectDistrict(event: any): void {
    this.selectedDistrict = event.target.value;
    this.fetchFilteredRoutes(); // รีเฟรชข้อมูลเมื่อเลือกเขต
  }



  fetchFilteredRoutes() {
    const params: any = {
      category: this.selectedCategory,
      routes: this.selectedRoute,
    };
  
    this.http.get<any[]>('https://just-scan-me-backend.onrender.com/api/routes', { params }).subscribe(
      (data) => {
  
        if (!Array.isArray(data)) {
          return;
        }
  
        this.routesData = data.filter(marker => {
          if (this.showNormal && marker.status === 1) return true;
          if (this.showFaulty && marker.status === 0) return true;
          return false;
        });
        this.calculateStatistics();
      },
      (error) => {
        console.error("Error fetching data:", error);
      }
    );
  }
  

  calculateStatistics() {
    this.totalMarkers = this.routesData.length;
    this.totalDB = this.routesData.filter(marker => marker.name_id?.toLowerCase().includes('db')).length;
    this.totalSG = this.routesData.filter(marker => marker.name_id?.toLowerCase().includes('sg')).length;

    this.totalFaulty = this.routesData.filter(marker => marker.status === 0).length;
    this.totalFaultyDB = this.routesData.filter(marker => marker.name_id?.toLowerCase().includes('db') && marker.status === 0).length;
    this.totalFaultySG = this.routesData.filter(marker => marker.name_id?.toLowerCase().includes('sg') && marker.status === 0).length;
  }

  getCategoryName(cat_id: any): string {
    if (cat_id == null || cat_id === undefined) {
      console.error("Category ID is undefined or null:", cat_id);
      return "ไม่ทราบหมวด";
    }
  
    switch (cat_id) {
      case 1: return "หมวดนครพนม";
      case 2: return "หมวดศรีสงคราม";
      case 3: return "หมวดปลาปาก";
      case 4: return "หมวดท่าอุเทน";
      case 5: return "หมวดนาแก";
      default: return "ไม่ทราบหมวด";
    }
  }
  
  

  mapCategoryName(routes: any[]): any[] {
    return routes.map(route => ({
      ...route,
      category_name: this.getCategoryName(route.cat_id),
    }));
  }

  fetchRoutes() {
    const apiUrl = 'https://just-scan-me-backend.onrender.com/api/get-routes';
    this.http.get<any[]>(apiUrl).subscribe({
      next: (data) => {
        this.filteredRoutesData = this.mapCategoryName(data.filter(route => route.status === 0));
      },
      error: (err) => console.error('Error fetching data:', err),
    });
  }

  downloadNotifyExcel() {
    const url = 'https://just-scan-me-backend.onrender.com/api/export-notify-to-excel';
    this.http.get(url, { responseType: 'blob' }).subscribe((data) => {
      const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = 'notify_data.xlsx';
      link.click();
    });
  }
  downloadRepairExcel() {
    const url = 'https://just-scan-me-backend.onrender.com/api/export-repair-to-excel';
    this.http.get(url, { responseType: 'blob' }).subscribe((data) => {
      const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = 'repair_completed.xlsx';
      link.click();
    });
  }

  onRowClick(route: any): void {
    if (!this.osmMapComponent) {
      console.error("osmMapComponent is not initialized yet.");
      return;
    }
  
    const marker = this.osmMapComponent.markerGroup?.getLayers()?.find((layer: L.Layer) => {
      if (layer instanceof L.Marker) {
        const latLng = layer.getLatLng();
        return latLng.lat === route.lat && latLng.lng === route.longitude;
      }
      return false;
    });
    
    if (marker) {
      marker.openPopup(); // เปิด Popup ของ Marker ที่พบ
    } else {
      console.log('Marker not found'); // หากไม่พบ Marker
    }
  
  }
  
}
