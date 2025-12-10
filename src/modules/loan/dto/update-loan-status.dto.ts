import { IsNotEmpty, IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LoanApplicationStatus } from '../../../common/enums';

export class UpdateLoanStatusDto {
  @ApiProperty({
    description: 'New loan application status',
    enum: LoanApplicationStatus,
    example: LoanApplicationStatus.APPROVED,
  })
  @IsNotEmpty()
  @IsEnum(LoanApplicationStatus)
  status: LoanApplicationStatus;

  @ApiPropertyOptional({
    description: 'Optional notes for status change',
    example: 'Approved based on credit score and income verification',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
