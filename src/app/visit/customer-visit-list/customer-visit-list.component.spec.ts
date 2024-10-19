import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerVisitListComponent } from './customer-visit-list.component';

describe('CustomerVisitListComponent', () => {
  let component: CustomerVisitListComponent;
  let fixture: ComponentFixture<CustomerVisitListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomerVisitListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CustomerVisitListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
