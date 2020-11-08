import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DoctorConferenceComponent } from './doctor-conference.component';

describe('DoctorConferenceComponent', () => {
  let component: DoctorConferenceComponent;
  let fixture: ComponentFixture<DoctorConferenceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DoctorConferenceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DoctorConferenceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
