import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WaitingEventsComponent } from './waiting-events.component';

describe('WaitingEventsComponent', () => {
  let component: WaitingEventsComponent;
  let fixture: ComponentFixture<WaitingEventsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WaitingEventsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WaitingEventsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
