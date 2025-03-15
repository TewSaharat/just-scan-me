import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FriebaseComponent } from './friebase.component';

describe('FriebaseComponent', () => {
  let component: FriebaseComponent;
  let fixture: ComponentFixture<FriebaseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FriebaseComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FriebaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
