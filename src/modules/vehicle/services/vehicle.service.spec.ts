import { Test, TestingModule } from '@nestjs/testing';
import { VehicleService } from './vehicle.service';

describe('VehicleService', () => {
  let service: VehicleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: VehicleService,
          useValue: {
            createVehicle: jest.fn(),
            getVehicleById: jest.fn(),
            updateVehicle: jest.fn(),
            deleteVehicle: jest.fn(),
            getAllVehicles: jest.fn(),
            searchVehicles: jest.fn(),
            validateVehicleExists: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<VehicleService>(VehicleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should have createVehicle method', () => {
    expect(service.createVehicle).toBeDefined();
  });

  it('should have getVehicleById method', () => {
    expect(service.getVehicleById).toBeDefined();
  });

  it('should have updateVehicle method', () => {
    expect(service.updateVehicle).toBeDefined();
  });

  it('should have deleteVehicle method', () => {
    expect(service.deleteVehicle).toBeDefined();
  });
});
