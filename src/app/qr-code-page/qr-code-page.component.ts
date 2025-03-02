import { Component, Inject,OnInit  } from '@angular/core';
import { MAT_DIALOG_DATA,MatDialogModule,MatDialog, MatDialogRef  } from '@angular/material/dialog';
import * as QRCode from 'qrcode';  // ใช้ไลบรารี QRCode
import { FormsModule, } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
    selector: 'app-qr-code-page',
    standalone: true,
    templateUrl: './qr-code-page.component.html',
    styleUrls: ['./qr-code-page.component.css'],
    imports: [FormsModule, CommonModule, MatDialogModule]
})
export class QrCodePageComponent {
  name_id!: string;
  qrCodeUrl: string = '';

  constructor(@Inject(MAT_DIALOG_DATA) public incomingData: any,
  private router: Router,
  private dialogRef: MatDialogRef<QrCodePageComponent>,
  ) 
  {
    this.name_id = incomingData.name_id;
    this.generateQRCode(this.name_id);
  }

  generateQRCode(name_id: string): void {
    const url = `http://localhost:4200/notify?name_id=${encodeURIComponent(name_id)}`;
    QRCode.toDataURL(url, (err, url) => {
      if (err) {
        console.error('Error generating QR code', err);
        return;
      }
      this.qrCodeUrl = url;
    });
  }

  printContent(): void {
    const printContent = document.getElementById('qrcode-content'); // ดึงเฉพาะเนื้อหาใน <div id="qrcode-content">
    if (printContent) {
      const printWindow = window.open('', '', 'width=800,height=800');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>พิมพ์ QR Code</title>
              <style>
                body { text-align: center; font-family: Arial, sans-serif; }
                .qrcode { margin: 10px auto; }
              </style>
            </head>
            <body>
              ${printContent.outerHTML} 
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
        printWindow.close();
      }
    }
  }
  
  
 onCancel() {
    this.dialogRef.close(); // ปิด Dialog
  }
}

