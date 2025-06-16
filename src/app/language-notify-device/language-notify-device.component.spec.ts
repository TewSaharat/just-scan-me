import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LanguageNotifyDeviceComponent } from './language-notify-device.component';

describe('LanguageNotifyDeviceComponent', () => {
  let component: LanguageNotifyDeviceComponent;
  let fixture: ComponentFixture<LanguageNotifyDeviceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LanguageNotifyDeviceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LanguageNotifyDeviceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
