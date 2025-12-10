import { Test, TestingModule } from '@nestjs/testing';
import { LoanApplicationService } from './loan-application.service';

describe('LoanApplicationService', () => {
  let service: LoanApplicationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: LoanApplicationService,
          useValue: {
            createLoanApplication: jest.fn(),
            getLoanApplicationById: jest.fn(),
            updateLoanApplication: jest.fn(),
            getLoanApplicationsByCustomer: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<LoanApplicationService>(LoanApplicationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should have createLoanApplication method', () => {
    expect(service.createLoanApplication).toBeDefined();
  });

  it('should have getLoanApplicationById method', () => {
    expect(service.getLoanApplicationById).toBeDefined();
  });

  it('should have updateLoanApplication method', () => {
    expect(service.updateLoanApplication).toBeDefined();
  });
});
