import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-notify',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './notify.component.html',
  styleUrl: './notify.component.css',
})
export class NotifyComponent implements OnInit {
  isNotifyVisible: boolean = true; // ควบคุมการแสดง <div class="notifyContent">
  isReceivedVisible: boolean = false; // ควบคุมการแสดง/ซ่อนของ <div class="Received">
  name_id: string = '';

  constructor(private route: ActivatedRoute, private http: HttpClient) {}

  @Output() dataSaved = new EventEmitter<void>(); // Emit เมื่อข้อมูลบันทึกเสร็จ

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      this.name_id = params['name_id'];
      if (this.name_id) {
        this.loadMarkerData(this.name_id); // ดึงข้อมูลของ Marker
      }
    });
  }

  loadMarkerData(name_id: string) {
    const apiUrl = `http://127.0.0.1:8000/api/marker/${encodeURIComponent(
      name_id
    )}`;
    this.http.get(apiUrl).subscribe({
      next: (response) => {
        console.log('Marker Data:', response);
      },
      error: (err) => {
        console.error('Error fetching marker data:', err);
      },
    });
  }

  notifyContent(): void {
    if (!this.name_id) {
      console.error('name_id is missing');
      return;
    }

    this.isReceivedVisible = true;
    this.isNotifyVisible = false;

    const now = new Date();
    const report_time = `${now.getDate().toString().padStart(2, '0')}-${(
      now.getMonth() + 1
    )
      .toString()
      .padStart(2, '0')}-${now.getFullYear()} ${now
      .getHours()
      .toString()
      .padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    const updateData = {
      name_id: this.name_id,
      status: false, //
      report_time: report_time, // วันที่และเวลา
    };

    const apiUrl = `http://127.0.0.1:8000/api/save-electric-pole`;
    this.http.post(apiUrl, updateData).subscribe({
      next: () => {
        console.log('Data saved successfully');
        this.dataSaved.emit(); // แจ้งว่าการบันทึกเสร็จสิ้น
      },
      error: (err) => {
        console.error('Error saving data:', err);
      },
    });
  }
}

// this.isReceivedVisible = true;
// this.isNotifyVisible = false;
