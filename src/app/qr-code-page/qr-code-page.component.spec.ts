import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QrCodePageComponent } from './qr-code-page.component';

describe('QrCodePageComponent', () => {
  let component: QrCodePageComponent;
  let fixture: ComponentFixture<QrCodePageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QrCodePageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(QrCodePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
