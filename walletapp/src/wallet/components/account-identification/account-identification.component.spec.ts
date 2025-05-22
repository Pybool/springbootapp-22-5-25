import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountIdentificationComponent } from './account-identification.component';

describe('AccountIdentificationComponent', () => {
  let component: AccountIdentificationComponent;
  let fixture: ComponentFixture<AccountIdentificationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccountIdentificationComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AccountIdentificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
