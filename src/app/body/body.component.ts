import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { WebSocketService } from '../websocket.service'; // นำเข้า WebSocketService
import { OsmMapComponent } from '../osm-map/osm-map.component';
import { BodyLightComponent } from '../body-light/body-light.component';
import { CommonModule } from '@angular/common';
import L from 'leaflet';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EditFormComponent } from '../edit-form/edit-form.component';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-body',
  standalone: true,
  imports: [OsmMapComponent, BodyLightComponent, CommonModule, FormsModule],
  templateUrl: './body.component.html',
  styleUrls: ['./body.component.css'],
})
export class BodyComponent implements OnInit, OnDestroy {
  @ViewChild(OsmMapComponent, { static: false })
  osmMapComponent!: OsmMapComponent;

  constructor(
    private http: HttpClient,
    private wsService: WebSocketService,
    private dialog: MatDialog,
    private authService: AuthService
  ) {}

  selectedDistrict: string = 'all'; // ค่าเริ่มต้นแสดงทุกเขต
  showNormal: boolean = true; // ควบคุมการแสดงสถานะปกติ
  showFaulty: boolean = true; // ควบคุมการแสดงสถานะเสีย

  selectedCategory: string = 'all';
  selectedRoute: string = 'all';

  filteredRoutesData: any[] = [];
  isCategoryLocked = true;
  routesData: any[] = [];
  private ws: WebSocket | null = null;

  totalMarkers: number = 0; // จำนวน Marker ทั้งหมด
  totalDB: number = 0; // จำนวน DB
  totalSG: number = 0; // จำนวน SG
  totalFaulty: number = 0; // จำนวน Marker ที่เสียทั้งหมด
  totalFaultyDB: number = 0; // จำนวน DB ที่เสีย
  totalFaultySG: number = 0; // จำนวน SG ที่เสีย

  ngOnInit() {
    this.authService.isLoggedIn().subscribe((loggedIn) => {
      if (!loggedIn) {
        // ยังไม่ login -> ปลดล็อก dropdown ให้เลือกได้
        this.selectedCategory = 'all'; // หรือค่าที่ต้องการเป็น default
        this.isCategoryLocked = false;
        this.fetchFilteredRoutes();
        this.fetchRoutes();
      } else {
        // login แล้ว ให้เช็ค role เหมือนเดิม
        this.authService.getUserRole().subscribe((role) => {
          if (role === 'admin' || role === 'Advanced_users') {
            this.selectedCategory = 'all';
            this.isCategoryLocked = false;
          } else {
            this.authService.getUserCategory().subscribe((category) => {
              this.selectedCategory = category;
              this.isCategoryLocked = true;
            });
          }
          this.fetchFilteredRoutes();
          this.fetchRoutes();
        });
      }
    });

    this.wsService.onUpdate((message) => {
      if (message.type === 'update') {
        this.fetchRoutes();
        this.fetchFilteredRoutes();
      }
    });

    setInterval(() => {
      this.fetchRoutes();
    }, 15 * 60 * 1000); // รีเฟรชข้อมูลทุก 15 นาที
  }

  handleDataUpdated() {
    this.fetchRoutes(); // ✅ โหลดข้อมูลตารางใหม่ (status = 0)
    this.fetchFilteredRoutes(); // ✅ โหลดข้อมูลทั้งหมดใหม่
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
    category: this.selectedCategory === 'all' ? '' : this.selectedCategory,
    routes: this.selectedRoute === 'all' ? '' : this.selectedRoute,
    district: this.selectedDistrict === 'all' ? '' : this.selectedDistrict,
  };

    this.http
      .get<any[]>('http://127.0.0.1:8000/api/routes', { params })
      .subscribe(
        (data) => {
          if (!Array.isArray(data)) {
            return;
          }
          this.routesData = data
            .filter((marker) => {
              if (this.showNormal && marker.status === 1) return true;
              if (this.showFaulty && marker.status === 0) return true;
              return false;
            })
            .sort(
              (a, b) => Date.parse(b.report_time) - Date.parse(a.report_time)
            );

          this.calculateStatistics();
        },
        (error) => {
          console.error('Error fetching data:', error);
        }
      );
  }

  calculateStatistics() {
    this.totalMarkers = this.routesData.length;

    this.totalDB = this.routesData.filter((marker) =>
      marker.name_id?.toLowerCase().includes('db')
    ).length;

    this.totalSG = this.routesData.filter((marker) =>
      marker.name_id?.toLowerCase().includes('sg')
    ).length;

    this.totalFaulty = this.routesData.filter(
      (marker) => marker.status === 0
    ).length;

    this.totalFaultyDB = this.routesData.filter(
      (marker) =>
        marker.status === 0 && marker.name_id?.toLowerCase().includes('db')
    ).length;

    this.totalFaultySG = this.routesData.filter(
      (marker) =>
        marker.status === 0 && marker.name_id?.toLowerCase().includes('sg')
    ).length;
  }

  getCategoryName(cat_id: any): string {
    if (cat_id == null || cat_id === undefined) {
      console.error('Category ID is undefined or null:', cat_id);
      return 'ไม่ทราบหมวด';
    }

    switch (cat_id) {
      case 1:
        return 'หมวดทางหลวงพนัสนิคม';
      case 2:
        return 'หมวดทางหลวงบ้านบึง';
      case 3:
        return 'หมวดทางหลวงศรีราชา';
      case 4:
        return 'หมวดทางหลวงบางละมุง';
      case 5:
        return 'หมวดทางหลวงสัตหีบ';
      case 6:
        return 'หมวดทางหลวงเมืองชลบุรี';
      default:
        return 'ไม่ทราบหมวด';
    }
  }

  mapCategoryName(routes: any[]): any[] {
    return routes.map((route) => ({
      ...route,
      category_name: this.getCategoryName(route.cat_id),
    }));
  }

  fetchRoutes() {
    const apiUrl = 'http://127.0.0.1:8000/api/get-routes';

    // ฟังก์ชันช่วยแปลงวันที่จาก "dd-MM-yyyy HH:mm" เป็น Date object
    function parseDateString(dateStr: string): Date {
      const [datePart, timePart] = dateStr.split(' ');
      const [day, month, year] = datePart.split('-').map(Number);
      const [hours, minutes] = timePart.split(':').map(Number);
      return new Date(year, month - 1, day, hours, minutes);
    }

    this.http.get<any[]>(apiUrl).subscribe({
      next: (data) => {
        console.log('RAW DATA FROM API:', data);
        this.filteredRoutesData = this.mapCategoryName(
          data.filter((route) => {
            const isCategoryMatch =
              this.selectedCategory === 'all' ||
              route.cat_id == this.selectedCategory;
            return route.status === 0 && isCategoryMatch;
          })
        ).sort((a, b) => {
          const aTime = a.report_time
            ? parseDateString(a.report_time).getTime()
            : 0;
          const bTime = b.report_time
            ? parseDateString(b.report_time).getTime()
            : 0;
          return bTime - aTime;
        });
      },
      error: (err) => console.error('Error fetching data:', err),
    });
  }

  downloadNotifyExcel() {
    const url = 'http://127.0.0.1:8000/api/export-notify-to-excel';
    this.http.get(url, { responseType: 'blob' }).subscribe((data) => {
      const blob = new Blob([data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = 'notify_data.xlsx';
      link.click();
    });
  }
  downloadRepairExcel() {
    const url = 'http://127.0.0.1:8000/api/export-repair-to-excel';
    this.http.get(url, { responseType: 'blob' }).subscribe((data) => {
      const blob = new Blob([data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = 'repair_completed.xlsx';
      link.click();
    });
  }

  onRowClick(route: any): void {
    if (!this.osmMapComponent || !this.osmMapComponent.getMarkerGroup()) {
      console.error('osmMapComponent or markerGroup is not initialized.');
      return;
    }

    const markerGroup = this.osmMapComponent.getMarkerGroup();
    let foundMarker: L.Marker | undefined;

    //  ตรวจสอบค่าก่อนใช้งาน
    const routeLat = parseFloat(route.lat);
    const routeLng = parseFloat(route.longitude);

    markerGroup.getLayers().forEach((layer: L.Layer) => {
      if (layer instanceof L.Marker) {
        const latLng = layer.getLatLng();
        //  ใช้ parseFloat เพื่อป้องกันปัญหา string / number และตัดจุดทศนิยมเกิน 6 ตำแหน่ง
        if (
          parseFloat(latLng.lat.toFixed(6)) ===
            parseFloat(routeLat.toFixed(6)) &&
          parseFloat(latLng.lng.toFixed(6)) === parseFloat(routeLng.toFixed(6))
        ) {
          foundMarker = layer as L.Marker;
        }
      }
    });

    if (foundMarker) {
      foundMarker.openPopup();
      this.osmMapComponent.map.setView(foundMarker.getLatLng(), 20, {
        animate: true,
      });
    } else {
    }
  }
}
