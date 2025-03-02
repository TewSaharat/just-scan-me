import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BodyLightComponent } from './body-light.component';

describe('BodyLightComponent', () => {
  let component: BodyLightComponent;
  let fixture: ComponentFixture<BodyLightComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BodyLightComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BodyLightComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
