import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LiveQueueDetailsComponent } from './live-queue-details.component';

describe('LiveQueueDetailsComponent', () => {
  let component: LiveQueueDetailsComponent;
  let fixture: ComponentFixture<LiveQueueDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LiveQueueDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LiveQueueDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
