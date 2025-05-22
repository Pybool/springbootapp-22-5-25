import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VirtualCardComponent } from './virtual-card.component';

describe('VirtualCardComponent', () => {
  let component: VirtualCardComponent;
  let fixture: ComponentFixture<VirtualCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VirtualCardComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(VirtualCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
