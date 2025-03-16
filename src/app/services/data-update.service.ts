import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataUpdateService {
  private updateSubject = new Subject<void>(); // ใช้ Subject เพื่อแจ้ง Component อื่นๆ
  update$ = this.updateSubject.asObservable(); // ให้ Component อื่น Subscribe ได้

  notifyUpdate() {
    this.updateSubject.next(); // ส่ง Event แจ้งให้ Component อื่นรู้ว่ามีการอัปเดต
  }
}
