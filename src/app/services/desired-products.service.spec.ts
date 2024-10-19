import { TestBed } from '@angular/core/testing';

import { DesiredProductsService } from './desired-products.service';

describe('DesiredProductsService', () => {
  let service: DesiredProductsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DesiredProductsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
