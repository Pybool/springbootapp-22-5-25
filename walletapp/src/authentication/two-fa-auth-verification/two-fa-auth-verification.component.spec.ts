import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TwoFaAuthVerificationComponent } from './two-fa-auth-verification.component';

describe('TwoFaAuthVerificationComponent', () => {
  let component: TwoFaAuthVerificationComponent;
  let fixture: ComponentFixture<TwoFaAuthVerificationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TwoFaAuthVerificationComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TwoFaAuthVerificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
