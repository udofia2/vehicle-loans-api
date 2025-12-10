import { Test, TestingModule } from '@nestjs/testing';
import { OfferService } from './offer.service';

describe('OfferService', () => {
  let service: OfferService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: OfferService,
          useValue: {
            createOffer: jest.fn(),
            getOfferById: jest.fn(),
            acceptOffer: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<OfferService>(OfferService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should have createOffer method', () => {
    expect(service.createOffer).toBeDefined();
  });

  it('should have getOfferById method', () => {
    expect(service.getOfferById).toBeDefined();
  });

  it('should have acceptOffer method', () => {
    expect(service.acceptOffer).toBeDefined();
  });
});
