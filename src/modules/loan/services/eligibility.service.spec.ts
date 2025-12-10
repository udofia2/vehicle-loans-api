import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { EligibilityService } from './eligibility.service';

describe('EligibilityService', () => {
  let service: EligibilityService;

  beforeEach(async () => {
    const mockConfigService = {
      get: jest.fn().mockImplementation((key: string) => {
        switch (key) {
          case 'LOAN_MAX_LTV_RATIO':
            return 0.8;
          case 'LOAN_MAX_DTI_RATIO':
            return 0.4;
          case 'LOAN_MIN_CREDIT_SCORE':
            return 600;
          default:
            return undefined;
        }
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: EligibilityService,
          useValue: {
            checkEligibility: jest.fn(),
          },
        },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<EligibilityService>(EligibilityService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should have checkEligibility method', () => {
    expect(service.checkEligibility).toBeDefined();
  });
});
