import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-excle-download',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './excle-download.component.html',
  styleUrl: './excle-download.component.css'
})
export class ExcleDownloadComponent {
  constructor(private http: HttpClient) {}

  private getCurrentDateString() {
    const now = new Date();
    // แปลงเป็นรูปแบบ yyyyMMdd เช่น 20250611
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0'); // เดือน 2 หลัก
    const day = String(now.getDate()).padStart(2, '0');        // วัน 2 หลัก
    return `${day}-${month}-${year}`;
  }

  downloadNotifyExcel() {
    const url = 'https://api.chonburihighway1.com/api/export-notify-to-excel';
    this.http.get(url, { responseType: 'blob' }).subscribe((data) => {
      const blob = new Blob([data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      const dateStr = this.getCurrentDateString();
      link.download = `notify_data_${dateStr}.xlsx`;  // เพิ่มวันที่ในชื่อไฟล์
      link.click();
    });
  }

  downloadRepairExcel() {
    const url = 'https://api.chonburihighway1.com/api/export-repair-to-excel';
    this.http.get(url, { responseType: 'blob' }).subscribe((data) => {
      const blob = new Blob([data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      const dateStr = this.getCurrentDateString();
      link.download = `repair_completed_${dateStr}.xlsx`; 
      link.click();
    });
  }
}
