import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { ValuationApiService } from './valuation-api.service';

describe('ValuationApiService', () => {
  let service: ValuationApiService;

  beforeEach(async () => {
    const mockHttpService = {
      get: jest.fn(),
    };

    const mockConfigService = {
      get: jest.fn().mockImplementation((key: string) => {
        switch (key) {
          case 'VALUATION_API_KEY':
            return 'test-key';
          case 'VALUATION_API_BASE_URL':
            return 'https://api.example.com';
          default:
            return undefined;
        }
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: ValuationApiService,
          useValue: {
            getValuation: jest.fn(),
          },
        },
        { provide: HttpService, useValue: mockHttpService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<ValuationApiService>(ValuationApiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should have getValuation method', () => {
    expect(service.getValuation).toBeDefined();
  });
});
