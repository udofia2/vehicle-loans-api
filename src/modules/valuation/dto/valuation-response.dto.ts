import { ApiProperty } from '@nestjs/swagger';
import { ValuationSource } from '../../../common/enums';
import { ValuationMetadata } from '../../../common/types';
import { Valuation } from '../entities/valuation.entity';

export class ValuationResponseDto {
  @ApiProperty({
    description: 'Valuation unique identifier',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  id: string;

  @ApiProperty({
    description: 'Vehicle ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  vehicleId: string;

  @ApiProperty({
    description: 'Estimated vehicle value',
    example: 25000.5,
  })
  estimatedValue: number;

  @ApiProperty({
    description: 'Minimum estimated value',
    example: 23000.0,
  })
  minValue: number;

  @ApiProperty({
    description: 'Maximum estimated value',
    example: 27000.0,
  })
  maxValue: number;

  @ApiProperty({
    description: 'Valuation source',
    enum: ValuationSource,
    example: ValuationSource.EXTERNAL_API,
  })
  source: ValuationSource;

  @ApiProperty({
    description: 'Valuation date',
    example: '2023-12-10T06:00:00.000Z',
  })
  valuationDate: Date;

  @ApiProperty({
    description: 'Valuation metadata',
    example: { confidence: 0.85, dataProvider: 'KBB' },
    required: false,
  })
  metadata: ValuationMetadata;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2023-12-10T06:00:00.000Z',
  })
  createdAt: Date;

  static fromEntity(valuation: Valuation): ValuationResponseDto {
    const response = new ValuationResponseDto();
    response.id = valuation.id;
    response.vehicleId = valuation.vehicleId;
    response.estimatedValue = valuation.estimatedValue;
    response.minValue = valuation.minValue;
    response.maxValue = valuation.maxValue;
    response.source = valuation.source;
    response.valuationDate = valuation.valuationDate;
    response.metadata = valuation.metadata;
    response.createdAt = valuation.createdAt;
    return response;
  }

  static fromEntities(valuations: Valuation[]): ValuationResponseDto[] {
    return valuations.map((valuation) => this.fromEntity(valuation));
  }
}
