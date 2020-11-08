import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BankKycFormComponent } from './bank-kyc-form.component';

describe('BankKycFormComponent', () => {
  let component: BankKycFormComponent;
  let fixture: ComponentFixture<BankKycFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BankKycFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BankKycFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
