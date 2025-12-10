import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoanApplication } from './entities/loan-application.entity';
import { LoanApplicationService } from './services/loan-application.service';
import { LoanApplicationRepository } from './repositories/loan-application.repository';
import { LoanApplicationController } from './controllers/loan-application.controller';
import { EligibilityService } from './services/eligibility.service';
import { VehicleModule } from '../vehicle/vehicle.module';
import { ValuationModule } from '../valuation/valuation.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([LoanApplication]),
    VehicleModule,
    ValuationModule,
  ],
  controllers: [LoanApplicationController],
  providers: [
    LoanApplicationService,
    LoanApplicationRepository,
    EligibilityService,
  ],
  exports: [
    LoanApplicationService,
    LoanApplicationRepository,
    EligibilityService,
  ],
})
export class LoanModule {}
