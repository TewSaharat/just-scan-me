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
    { id: 1, name: 'หมวดนครพนม' },
    { id: 2, name: 'หมวดศรีสงคราม' },
    { id: 3, name: 'หมวดปลาปาก' },
    { id: 4, name: 'หมวดท่าอุเทน' },
    { id: 5, name: 'หมวดนาแก' },
  ];

  constructor(private http: HttpClient) {}

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  uploadFile() {
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

    // ✅ ตรวจสอบว่าฟอร์มมีไฟล์จริง
    console.log('Uploading file:', this.selectedFile.name);
    console.log('Uploading cat_id:', this.selectedcat_id);

    this.http
      .post('https://api.chonburihighway1.com/api/upload-kml', formData)
      .subscribe({
        next: () => {
          this.uploadStatus = '✅ อัปโหลดสำเร็จ!';
          this.isLoading = false;
          console.log('Upload Success');
        },
        error: (error) => {
          console.error('Error response:', error);
          this.uploadStatus = `❌ ${error.error.message}`;
          this.isLoading = false;
        },
      });
  }

  toggleSidebar() {
    this.isSidebarVisible = !this.isSidebarVisible;
  }
}
