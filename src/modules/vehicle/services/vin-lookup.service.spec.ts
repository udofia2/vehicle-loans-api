import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { VinLookupService } from './vin-lookup.service';

describe('VinLookupService', () => {
  let service: VinLookupService;

  beforeEach(async () => {
    const mockHttpService = {
      get: jest.fn(),
    };

    const mockConfigService = {
      get: jest.fn().mockImplementation((key: string) => {
        switch (key) {
          case 'VIN_API_KEY':
            return 'test-key';
          case 'VIN_API_BASE_URL':
            return 'https://api.example.com';
          default:
            return undefined;
        }
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: VinLookupService,
          useValue: {
            lookupVin: jest.fn(),
          },
        },
        { provide: HttpService, useValue: mockHttpService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<VinLookupService>(VinLookupService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should have lookupVin method', () => {
    expect(service.lookupVin).toBeDefined();
  });
});
