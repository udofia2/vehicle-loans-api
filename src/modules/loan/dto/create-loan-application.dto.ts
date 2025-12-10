import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsEnum,
  IsOptional,
  IsUUID,
  IsEmail,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { LoanApplicationStatus } from '../../../common/enums';

export class CreateLoanApplicationDto {
  @ApiProperty({
    description: 'Vehicle ID for loan application',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsNotEmpty()
  @IsUUID()
  vehicleId: string;

  @ApiProperty({
    description: 'Valuation ID for loan application',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @IsNotEmpty()
  @IsUUID()
  valuationId: string;

  @ApiProperty({
    description: 'Applicant full name',
    example: 'John Doe',
    minLength: 2,
    maxLength: 100,
  })
  @IsNotEmpty()
  @IsString()
  applicantName: string;

  @ApiProperty({
    description: 'Applicant email address',
    example: 'john.doe@example.com',
  })
  @IsNotEmpty()
  @IsEmail()
  applicantEmail: string;

  @ApiProperty({
    description: 'Applicant phone number',
    example: '+234801234567',
  })
  @IsNotEmpty()
  @IsString()
  applicantPhone: string;

  @ApiProperty({
    description: 'Monthly income in currency',
    example: 500000,
    minimum: 1,
  })
  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(1)
  monthlyIncome: number;

  @ApiProperty({
    description: 'Employment status',
    enum: ['EMPLOYED', 'SELF_EMPLOYED', 'UNEMPLOYED', 'RETIRED'],
    example: 'EMPLOYED',
  })
  @IsNotEmpty()
  @IsString()
  @IsEnum(['EMPLOYED', 'SELF_EMPLOYED', 'UNEMPLOYED', 'RETIRED'])
  employmentStatus: string;

  @ApiProperty({
    description: 'Requested loan amount',
    example: 20000.0,
    minimum: 1000,
  })
  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(1000)
  loanAmount: number;

  @ApiProperty({
    description: 'Interest rate (percentage)',
    example: 5.25,
    minimum: 0,
    maximum: 50,
  })
  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  interestRate: number;

  @ApiProperty({
    description: 'Loan term in months',
    example: 60,
    minimum: 12,
    maximum: 84,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(12)
  termMonths: number;

  @ApiProperty({
    description: 'Additional notes',
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
