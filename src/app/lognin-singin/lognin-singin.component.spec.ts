import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LogninSinginComponent } from './lognin-singin.component';

describe('LogninSinginComponent', () => {
  let component: LogninSinginComponent;
  let fixture: ComponentFixture<LogninSinginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LogninSinginComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LogninSinginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
