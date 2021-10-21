import { TestBed } from '@angular/core/testing';

import { TradeStateService } from './trade-state.service';

describe('TradeStateService', () => {
  let service: TradeStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TradeStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
