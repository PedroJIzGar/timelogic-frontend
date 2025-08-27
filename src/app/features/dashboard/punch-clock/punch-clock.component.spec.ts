import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PunchClockComponent } from './punch-clock.component';

describe('PunchClockComponent', () => {
  let component: PunchClockComponent;
  let fixture: ComponentFixture<PunchClockComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PunchClockComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PunchClockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
