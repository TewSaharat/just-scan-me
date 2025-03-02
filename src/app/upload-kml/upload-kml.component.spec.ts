import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadKMLComponent } from './upload-kml.component';

describe('UploadKMLComponent', () => {
  let component: UploadKMLComponent;
  let fixture: ComponentFixture<UploadKMLComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UploadKMLComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UploadKMLComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
