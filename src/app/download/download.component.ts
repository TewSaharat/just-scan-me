import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as QRCode from 'qrcode'; // ใช้ไลบรารี QRCode
import JSZip from 'jszip';
import { saveAs } from 'file-saver'; // ใช้ไลบรารี FileSaver

@Component({
  selector: 'app-download',
  templateUrl: './download.component.html',
  styleUrls: ['./download.component.css'],
})
export class DownloadComponent implements OnInit {
  apiUrl: string = 'https://just-scan-me-backend.onrender.com/api/routes'; // URL API

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.getDataFromAPI();
  }

  // ดึงข้อมูลจาก API
  getDataFromAPI(): void {
    this.http.get<any[]>(this.apiUrl).subscribe(async (response) => {
      const zip = new JSZip();

      // สร้าง Array ของ Promises
      const tasks = response.map((data) => {
        const { name_id, cat_id, routes } = data;
        const url = `https://chonburihighway1.com//notify?name_id=${encodeURIComponent(
          name_id
        )}`;
        return this.createQRCodeAndAddToZip(url, name_id, cat_id, routes, zip);
      });

      try {
        await Promise.all(tasks); // รอให้ทุก QR ถูกสร้างเสร็จ
        this.generateZipFile(zip); // แล้วค่อย generate zip
      } catch (error) {
        console.error('Error generating QR codes:', error);
      }
    });
  }

  getCategoryName(cat_id: number): string {
    switch (cat_id.toString()) {
      case '1':
        return 'หมวดนครพนม';
      case '2':
        return 'หมวดศรีสงคราม';
      case '3':
        return 'หมวดปลาปาก';
      case '4':
        return 'หมวดท่าอุเทน';
      case '5':
        return 'หมวดนาแก';
      default:
        return 'ไม่ทราบหมวด';
    }
  }

  sanitizeFolderName(name: string): string {
    return name.replace(/[<>:"\/\\|?*\x00-\x1F]/g, '').trim();
  }

  generateZipFile(zip: JSZip): void {
    zip.generateAsync({ type: 'blob' }).then((content) => {
      saveAs(content, 'qrcodes.zip');
    });
  }

  // สร้าง QR และเพิ่มเข้า ZIP
  createQRCodeAndAddToZip(
    url: string,
    name_id: string,
    cat_id: number,
    routes: string,
    zip: JSZip
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      QRCode.toDataURL(
        url,
        { type: 'image/png', width: 200 },
        (err, qrCodeUrl) => {
          if (err) {
            console.error('Error generating QR code', err);
            return reject(err);
          }

          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) return reject('Canvas context not available');

          const width = 300;
          const height = 400;
          canvas.width = width;
          canvas.height = height;

          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, width, height);

          ctx.fillStyle = '#000000';
          ctx.font = '18px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('ไฟฟ้าส่องสว่างขัดข้อง', width / 2, 40);
          ctx.font = '16px Arial';
          ctx.fillText('แสกนที่นี่', width / 2, 70);

          const qrImg = new Image();
          qrImg.onload = () => {
            ctx.drawImage(qrImg, (width - 200) / 2, 80, 200, 200);
            ctx.font = '16px Arial';
            ctx.fillText(name_id, width / 2, 320);

            canvas.toBlob((blob) => {
              if (blob) {
                const categoryName = this.getCategoryName(cat_id);
                const sanitizedRoute = this.sanitizeFolderName(routes);
                const folderPath = `${categoryName}/${sanitizedRoute}`;
                zip.folder(folderPath)?.file(`${name_id}.png`, blob);
                resolve();
              } else {
                reject('Failed to convert canvas to blob');
              }
            }, 'image/png');
          };
          qrImg.onerror = () => reject('QR image load error');
          qrImg.src = qrCodeUrl;
        }
      );
    });
  }
}
