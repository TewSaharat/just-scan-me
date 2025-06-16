import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-kml-upload',
  templateUrl: './kml-upload.component.html',
  styleUrls: ['./kml-upload.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterOutlet, RouterModule],
})
export class KmlUploadComponent {
  selectedFile: File | null = null;
  selectedcat_id: number | null = null;
  uploadStatus: string = '';
  isLoading: boolean = false;

  isSidebarVisible = false;

  cat_id = [
    { id: 1, name: 'หมวดทางหลวงพนัสนิคม' },
    { id: 2, name: 'หมวดทางหลวงบ้านบึง' },
    { id: 3, name: 'หมวดทางหลวงศรีราชา' },
    { id: 4, name: 'หมวดทางหลวงบางละมุง' },
    { id: 5, name: 'หมวดทางหลวงสัตหีบ' },
    { id: 6, name: 'หมวดทางหลวงเมืองชลบุรี' },
  ];

  constructor(private http: HttpClient) {}

  isLoggedIn(): boolean {
    return !!localStorage.getItem('auth_token');
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  uploadFile() {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      this.uploadStatus = '❌ กรุณาล็อกอินก่อนทำการอัปโหลด';
      console.error('ไม่พบ token กรุณาล็อกอินก่อน');
      return;
    }

    if (!this.selectedFile) {
      this.uploadStatus = 'กรุณาเลือกไฟล์ก่อน!';
      console.error('Error: ไม่มีไฟล์ที่เลือก');
      return;
    }

    if (!this.selectedcat_id) {
      this.uploadStatus = 'กรุณาเลือกผู้รับผิดชอบก่อน!';
      console.error('Error: ไม่มีหมวดหมู่ที่เลือก');
      return;
    }

    this.isLoading = true;
    this.uploadStatus = 'กำลังอัปโหลดไฟล์...';

    const formData = new FormData();
    formData.append('file', this.selectedFile);
    formData.append('cat_id', this.selectedcat_id.toString());

    this.http
      .post(
        'https://just-scan-me-backend.onrender.com/api/upload-kml',
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .subscribe({
        next: () => {
          this.uploadStatus = '✅ อัปโหลดสำเร็จ!';
          this.isLoading = false;
          console.log('Upload Success');
        },
        error: (error) => {
          console.error('Error response:', error);
          this.uploadStatus = `❌ ${
            error.error?.message || 'อัปโหลดไม่สำเร็จ'
          }`;
          this.isLoading = false;
        },
      });
  }

  toggleSidebar() {
    this.isSidebarVisible = !this.isSidebarVisible;
  }
}
