import { Test, TestingModule } from '@nestjs/testing';
import { ValuationService } from './valuation.service';

describe('ValuationService', () => {
  let service: ValuationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: ValuationService,
          useValue: {
            createValuation: jest.fn(),
            getValuationById: jest.fn(),
            generateValuationFromApi: jest.fn(),
            getValuationsByVehicleId: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ValuationService>(ValuationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should have createValuation method', () => {
    expect(service.createValuation).toBeDefined();
  });

  it('should have getValuationById method', () => {
    expect(service.getValuationById).toBeDefined();
  });

  it('should have generateValuationFromApi method', () => {
    expect(service.generateValuationFromApi).toBeDefined();
  });
});
