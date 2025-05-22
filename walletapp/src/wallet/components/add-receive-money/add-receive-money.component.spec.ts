import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddReceiveMoneyComponent } from './add-receive-money.component';

describe('AddReceiveMoneyComponent', () => {
  let component: AddReceiveMoneyComponent;
  let fixture: ComponentFixture<AddReceiveMoneyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddReceiveMoneyComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddReceiveMoneyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
