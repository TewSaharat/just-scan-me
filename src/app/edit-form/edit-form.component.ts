import { Component, Inject, EventEmitter, Output } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../services/auth.service';


@Component({
    selector: 'app-edit-form',
    standalone: true,
    templateUrl: './edit-form.component.html',
    styleUrls: ['./edit-form.component.css'],
    imports: [FormsModule, CommonModule, MatDialogModule]
})

export class EditFormComponent {
  
  constructor(
    private dialogRef: MatDialogRef<EditFormComponent>,
    @Inject(MAT_DIALOG_DATA) public incomingData: any,
    private http: HttpClient,private authService: AuthService
   
  ) {}

  @Output() dataSaved = new EventEmitter<void>(); // Emit เมื่อข้อมูลบันทึกเสร็จ

  name_id: string = '';
  lampType_edit = ['HPS', 'LED', 'อื่นๆ'];
  markerData: any = {};

  toggleStatusTemp: boolean = false;
  isLoggedIn = false;
  isAdmin = false;

  data = {
    lampType_edit: 'HPS',
    controller_edit: '',
    constructionDate: '',
    contractNumber: '',
    notes: '',
    status: false,
    repairMethod: '',
    complaintChannel: '',
    complaintCode: '',
    complaintTopic: '',
    complaintReason: '',
    lastRepairDate: '',
    controlType: '',
    repairItems: {} as Record<string, boolean>,
    
  };

  repairItemList = [
    { label: 'หลอดไฮเพรสเซอร์ 250 W', value: 'bulb250W' },
    { label: 'บัลลาสต์ 250 W', value: 'ballast250W' },
    { label: 'อิกนิเตอร์', value: 'ignitor' },
    { label: 'โฟโต้เซลล์', value: 'photoCell' },
    { label: 'คาปาซิเตอร์', value: 'capacitor' },
    { label: 'Fuse Link 3 A', value: 'fuseLink3A' },
    { label: 'ฟิวส์ 16 A', value: 'fuseLink16A' },
    { label: 'ฟิวส์ 50 A', value: 'fuseLink50A' },
    { label: 'ฟิวส์ 80 A', value: 'fuseLink80A' },
    { label: 'โฟโต้รีเลย์ 60 A', value: 'photorelay60A' },
    { label: 'สลิปข้อต่อสายไฟ เบอร์ 8', value: 'slipWireJointSize8' },
    { label: 'ฟิวส์ 100 A', value: 'fuseLink100A' },
    { label: 'ตูเซฟตี้สวิทช์ 60 A', value: 'safetySwitch60A' },
    { label: 'ตูเซฟตี้สวิทช์ 30 A 240 V', value: 'safetySwitch30A240V' },
    { label: 'ฟิวส์กระบอก 30 A 240 V', value: 'cylinderFuse30A240V' },
    { label: 'ฟิวส์กระบอก 60 A 240 V', value: 'cylinderFuse60A240V' },
    { label: 'ฟิวส์กระบอก 60 A 600 V', value: 'cylinderFuse60A600V' },
    { label: 'อื่นๆ', value: 'other' },
  ];



  ngOnInit() {

    this.authService.getUser().subscribe(user => {
      this.isLoggedIn = true;
      this.isAdmin = user.role === 'admin';
    }, error => {
      console.error('Auth Error:', error);
      this.isLoggedIn = false;
    });

    // ตรวจสอบว่ามีข้อมูลส่งเข้ามาหรือไม่
    if (this.incomingData) {
      try {
        // โหลดข้อมูลจาก incomingData และปรับปรุงค่า repairItems
        this.data = {
          ...this.data,
          ...this.incomingData,
          repairItems: this.incomingData.repairItems
  ? typeof this.incomingData.repairItems === 'string'
    ? JSON.parse(this.incomingData.repairItems)
    : this.incomingData.repairItems
  : {},

        };
      } catch (error) {
        console.error('Error parsing repairItems:', error);
        // หาก parsing ไม่สำเร็จ ตั้งค่าซ่อมบำรุงเป็น object เปล่า
        this.data.repairItems = {};
      }
    }

  }
  
  initializeRepairItems() {
    this.repairItemList.forEach((item) => {
      this.data.repairItems[item.value] = false;
    });
  }

  toggleStatus() {
    if (!this.data.status) {
      this.resetRepairData();
    } else {
      this.resetComplaintData();
    }
  }

  resetRepairData() {
    this.data.repairMethod = '';
    Object.keys(this.data.repairItems).forEach((key) => {
      this.data.repairItems[key] = false;
    });
  }

  resetComplaintData() {
    this.data.complaintChannel = '';
    this.data.complaintCode = '';
    this.data.complaintTopic = '';
    this.data.complaintReason = '';
  }

  onSave() {

    const token = localStorage.getItem('token');
    if (!token) {
      alert("คุณต้องล็อกอินก่อนบันทึกข้อมูล");
      return;
    }
    
    const hasRepairItems = Object.values(this.data.repairItems).some((value) => value);
    const hasDataFilled =
      (this.data.controller_edit && this.data.controller_edit.trim() !== '') ||
      (this.data.constructionDate && this.data.constructionDate.trim() !== '') ||
      (this.data.contractNumber && this.data.contractNumber.trim() !== '') ||
      (this.data.notes && this.data.notes.trim() !== '') ||
      (this.data.complaintChannel && this.data.complaintChannel.trim() !== '') ||
      (this.data.complaintCode && this.data.complaintCode.trim() !== '') ||
      (this.data.complaintTopic && this.data.complaintTopic.trim() !== '') ||
      (this.data.complaintReason && this.data.complaintReason.trim() !== '');
    if (hasRepairItems || hasDataFilled) {
      this.data.status = true;
    }


;
    // const saveUrl = 'https://just-scan-me-backend.onrender.com/api/save-electric-pole';
    const saveUrl = 'https://just-scan-me-backend.onrender.com/api/save-electric-pole';
    this.http.post(saveUrl, this.data).subscribe({
      next: () => {
        alert('บันทึกข้อมูลสำเร็จ!');
        this.dialogRef.close(true);
        this.dataSaved.emit(); // แจ้งไปยัง `BodyComponent` ว่าบันทึกสำเร็จ
      },
      error: (err) => {
        console.error('Error:', err);
        alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
      },
    });
  }

  loadMarkerData(name_id: string) {
  
    const apiUrl = `https://just-scan-me-backend.onrender.com/api/marker/${name_id}`;
    this.http.get(apiUrl).subscribe({
      next: (response: any) => {
  
        // กำหนดค่า response ให้กับ `data`
        this.data = {
          ...this.data,
          ...response,
          longitude: response.lng,
          repairItems: response.repairItems
            ? JSON.parse(response.repairItems)
            : {},
        };
      },
      error: (err) => {
        console.error('Error loading marker data:', err);
      },
    });
  }
  

  onCancel() {
    this.dialogRef.close(); // ปิด Dialog
  }
  getSelectedRepairItems() {
    return Object.keys(this.data.repairItems)
      .filter(key => this.data.repairItems[key])
      .join(', ');
  }
  onQrCodeScanned() {
    this.dialogRef.close({ openEditForm: true });
  }

 
}
