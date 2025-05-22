import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PurpleSpinnerComponent } from './purple-spinner.component';

describe('PurpleSpinnerComponent', () => {
  let component: PurpleSpinnerComponent;
  let fixture: ComponentFixture<PurpleSpinnerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PurpleSpinnerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PurpleSpinnerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
