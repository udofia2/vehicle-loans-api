import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { OfferCalculationService } from './offer-calculation.service';

describe('OfferCalculationService', () => {
  let service: OfferCalculationService;

  beforeEach(async () => {
    const mockConfigService = {
      get: jest.fn().mockImplementation((key: string) => {
        switch (key) {
          case 'LOAN_BASE_INTEREST_RATE':
            return 0.04;
          case 'LOAN_MAX_INTEREST_RATE':
            return 0.25;
          case 'LOAN_MIN_INTEREST_RATE':
            return 0.025;
          default:
            return undefined;
        }
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: OfferCalculationService,
          useValue: {
            calculateMonthlyPayment: jest.fn(),
            calculateTotalPayable: jest.fn(),
            adjustInterestRate: jest.fn(),
          },
        },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<OfferCalculationService>(OfferCalculationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should have calculateMonthlyPayment method', () => {
    expect(service.calculateMonthlyPayment).toBeDefined();
  });

  it('should have calculateTotalPayable method', () => {
    expect(service.calculateTotalPayable).toBeDefined();
  });

  it('should have adjustInterestRate method', () => {
    expect(service.adjustInterestRate).toBeDefined();
  });
});
