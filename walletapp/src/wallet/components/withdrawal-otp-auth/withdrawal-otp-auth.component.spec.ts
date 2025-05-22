import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WithdrawalOtpAuthComponent } from './withdrawal-otp-auth.component';

describe('WithdrawalOtpAuthComponent', () => {
  let component: WithdrawalOtpAuthComponent;
  let fixture: ComponentFixture<WithdrawalOtpAuthComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WithdrawalOtpAuthComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WithdrawalOtpAuthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
