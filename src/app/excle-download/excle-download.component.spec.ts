import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExcleDownloadComponent } from './excle-download.component';

describe('ExcleDownloadComponent', () => {
  let component: ExcleDownloadComponent;
  let fixture: ComponentFixture<ExcleDownloadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExcleDownloadComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExcleDownloadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
