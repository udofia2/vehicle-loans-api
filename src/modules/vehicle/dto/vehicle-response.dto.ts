import { ApiProperty } from '@nestjs/swagger';
import {
  VehicleCondition,
  TransmissionType,
  FuelType,
} from '../../../common/enums';
import { Vehicle } from '../entities/vehicle.entity';

export class VehicleResponseDto {
  @ApiProperty({
    description: 'Vehicle unique identifier',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    description: 'Vehicle Identification Number (VIN)',
    example: '1HGBH41JXMN109186',
  })
  vin: string;

  @ApiProperty({
    description: 'Vehicle manufacturer',
    example: 'Toyota',
  })
  make: string;

  @ApiProperty({
    description: 'Vehicle model',
    example: 'Camry',
  })
  model: string;

  @ApiProperty({
    description: 'Vehicle year',
    example: 2020,
  })
  year: number;

  @ApiProperty({
    description: 'Vehicle mileage',
    example: 50000,
  })
  mileage: number;

  @ApiProperty({
    description: 'Vehicle condition',
    enum: VehicleCondition,
    example: VehicleCondition.GOOD,
  })
  condition: VehicleCondition;

  @ApiProperty({
    description: 'Vehicle transmission type',
    enum: TransmissionType,
    example: TransmissionType.AUTOMATIC,
  })
  transmission: TransmissionType;

  @ApiProperty({
    description: 'Vehicle fuel type',
    enum: FuelType,
    example: FuelType.GASOLINE,
  })
  fuelType: FuelType;

  @ApiProperty({
    description: 'Vehicle color',
    example: 'Blue',
  })
  color: string;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2023-12-10T06:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2023-12-10T06:00:00.000Z',
  })
  updatedAt: Date;

  static fromEntity(vehicle: Vehicle): VehicleResponseDto {
    const response = new VehicleResponseDto();
    response.id = vehicle.id;
    response.vin = vehicle.vin;
    response.make = vehicle.make;
    response.model = vehicle.model;
    response.year = vehicle.year;
    response.mileage = vehicle.mileage;
    response.condition = vehicle.condition;
    response.transmission = vehicle.transmission;
    response.fuelType = vehicle.fuelType;
    response.color = vehicle.color;
    response.createdAt = vehicle.createdAt;
    response.updatedAt = vehicle.updatedAt;
    return response;
  }

  static fromEntities(vehicles: Vehicle[]): VehicleResponseDto[] {
    return vehicles.map((vehicle) => this.fromEntity(vehicle));
  }
}
