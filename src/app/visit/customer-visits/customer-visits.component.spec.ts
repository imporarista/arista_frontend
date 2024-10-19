import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerVisitsComponent } from './customer-visits.component';

describe('CustomerVisitsComponent', () => {
  let component: CustomerVisitsComponent;
  let fixture: ComponentFixture<CustomerVisitsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomerVisitsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CustomerVisitsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
