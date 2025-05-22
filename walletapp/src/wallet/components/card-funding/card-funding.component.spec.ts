import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardFundingComponent } from './card-funding.component';

describe('CardFundingComponent', () => {
  let component: CardFundingComponent;
  let fixture: ComponentFixture<CardFundingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardFundingComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CardFundingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
