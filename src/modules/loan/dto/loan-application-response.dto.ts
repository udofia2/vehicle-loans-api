import { ApiProperty } from '@nestjs/swagger';
import { LoanApplicationStatus } from '../../../common/enums';
import { LoanApplication } from '../entities/loan-application.entity';

export class LoanApplicationResponseDto {
  @ApiProperty({
    description: 'Loan application unique identifier',
    example: '550e8400-e29b-41d4-a716-446655440002',
  })
  id: string;

  @ApiProperty({
    description: 'Vehicle ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  vehicleId: string;

  @ApiProperty({
    description: 'Valuation ID',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  valuationId: string;

  @ApiProperty({
    description: 'Requested loan amount',
    example: 20000.0,
  })
  loanAmount: number;

  @ApiProperty({
    description: 'Interest rate percentage',
    example: 5.25,
  })
  interestRate: number;

  @ApiProperty({
    description: 'Loan term in months',
    example: 36,
  })
  termMonths: number;

  @ApiProperty({
    description: 'Loan application status',
    enum: LoanApplicationStatus,
    example: LoanApplicationStatus.PENDING,
  })
  status: LoanApplicationStatus;

  @ApiProperty({
    description: 'Additional notes',
    example: 'Customer has excellent credit history',
    required: false,
  })
  notes: string;

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

  static fromEntity(
    loanApplication: LoanApplication,
  ): LoanApplicationResponseDto {
    const response = new LoanApplicationResponseDto();
    response.id = loanApplication.id;
    response.vehicleId = loanApplication.vehicleId;
    response.valuationId = loanApplication.valuationId;
    response.loanAmount = loanApplication.loanAmount;
    response.interestRate = loanApplication.interestRate;
    response.termMonths = loanApplication.termMonths;
    response.status = loanApplication.status;
    response.notes = loanApplication.notes;
    response.createdAt = loanApplication.createdAt;
    response.updatedAt = loanApplication.updatedAt;
    return response;
  }

  static fromEntities(
    loanApplications: LoanApplication[],
  ): LoanApplicationResponseDto[] {
    return loanApplications.map((loanApp) => this.fromEntity(loanApp));
  }
}
