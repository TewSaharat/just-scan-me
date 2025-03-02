import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private socket: WebSocket | null = null;

  constructor() {}

  // ฟังก์ชันสำหรับเชื่อมต่อกับ WebSocket
  connect(url: string): void {
    this.socket = new WebSocket(url);

    // ตั้งค่าเมื่อได้รับข้อความจากเซิร์ฟเวอร์
    this.socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      this.handleMessage(message);
    };

    this.socket.onopen = () => {
      console.log('WebSocket connection established.');
    };

    this.socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    this.socket.onclose = () => {
      console.log('WebSocket connection closed.');
    };
  }

  // ฟังก์ชันที่เรียกเมื่อได้รับข้อความจาก WebSocket
  private handleMessage(message: any): void {
    console.log('Received WebSocket message:', message);
  }

  // ฟังก์ชันส่งข้อความไปยัง WebSocket
  sendMessage(message: any): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
    }
  }

  // ฟังก์ชันปิดการเชื่อมต่อ WebSocket
  disconnect(): void {
    if (this.socket) {
      this.socket.close();
    }
  }

  // ฟังก์ชันสำหรับการรับข้อมูลอัพเดทจากเซิร์ฟเวอร์
  onUpdate(callback: (message: any) => void) {
    if (this.socket) {
      this.socket.onmessage = (event) => {
        const message = JSON.parse(event.data);
        callback(message);
      };
    }
  }
}
