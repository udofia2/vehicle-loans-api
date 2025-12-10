import { Injectable, Logger } from '@nestjs/common';
import { LoanApplication } from '../entities/loan-application.entity';
import {
  EligibilityResult,
  EligibilityCheckCriteria,
} from '../interfaces/eligibility-result.interface';
import { VehicleService } from '../../vehicle/services/vehicle.service';
import { ValuationService } from '../../valuation/services/valuation.service';

@Injectable()
export class EligibilityService {
  private readonly logger = new Logger(EligibilityService.name);

  private readonly criteria: EligibilityCheckCriteria = {
    maxLtvRatio: 0.8, // 80%
    maxDtiRatio: 0.4, // 40%
    minMonthlyIncome: 150000, // ₦150,000
    maxVehicleAge: 15, // 15 years
    validLoanTerms: [12, 24, 36, 48, 60],
    minLoanAmount: 500000, // ₦500,000
    maxLoanAmount: 50000000, // ₦50,000,000
  };

  constructor(
    private readonly vehicleService: VehicleService,
    private readonly valuationService: ValuationService,
  ) {}

  async checkEligibility(
    application: LoanApplication,
  ): Promise<EligibilityResult> {
    this.logger.log(
      `Checking eligibility for loan application: ${application.id}`,
    );

    const reasons: string[] = [];
    const recommendations: string[] = [];
    let isEligible = true;

    const details: {
      ltvRatio?: number;
      dtiRatio?: number;
      vehicleAge?: number;
      monthlyIncome?: number;
      requestedAmount?: number;
      vehicleValue?: number;
      employmentStatus?: string;
      loanTerm?: number;
    } = {
      monthlyIncome: application.monthlyIncome,
      requestedAmount: application.loanAmount,
      employmentStatus: application.employmentStatus,
      loanTerm: application.termMonths,
    };

    try {
      // 1. Check vehicle exists and get vehicle data
      const vehicle = await this.vehicleService.getVehicleById(
        application.vehicleId,
      );

      // 2. Check vehicle age (≤ 15 years)
      const currentYear = new Date().getFullYear();
      const vehicleAge = currentYear - vehicle.year;
      details.vehicleAge = vehicleAge;

      if (vehicleAge > this.criteria.maxVehicleAge) {
        isEligible = false;
        reasons.push(
          `Vehicle is too old (${vehicleAge} years). Maximum allowed age is ${this.criteria.maxVehicleAge} years.`,
        );
        recommendations.push('Consider a newer vehicle for loan eligibility.');
      }

      // 3. Check employment status
      if (application.employmentStatus === 'unemployed') {
        isEligible = false;
        reasons.push(
          'Employment status is unemployed. Loan requires stable income source.',
        );
        recommendations.push(
          'Please provide proof of employment or alternative income source.',
        );
      }

      // 4. Check minimum income (≥ ₦150,000)
      if (application.monthlyIncome < this.criteria.minMonthlyIncome) {
        isEligible = false;
        reasons.push(
          `Monthly income (₦${application.monthlyIncome.toLocaleString()}) is below minimum requirement (₦${this.criteria.minMonthlyIncome.toLocaleString()}).`,
        );
        recommendations.push(
          `Minimum monthly income of ₦${this.criteria.minMonthlyIncome.toLocaleString()} is required.`,
        );
      }

      // 5. Check loan term validity
      if (!this.criteria.validLoanTerms.includes(application.termMonths)) {
        isEligible = false;
        reasons.push(
          `Loan term ${application.termMonths} months is not valid. Valid terms are: ${this.criteria.validLoanTerms.join(', ')} months.`,
        );
        recommendations.push(
          `Choose from available loan terms: ${this.criteria.validLoanTerms.join(', ')} months.`,
        );
      }

      // 6. Check loan amount bounds
      if (application.loanAmount < this.criteria.minLoanAmount) {
        isEligible = false;
        reasons.push(
          `Requested amount (₦${application.loanAmount.toLocaleString()}) is below minimum (₦${this.criteria.minLoanAmount.toLocaleString()}).`,
        );
        recommendations.push(
          `Minimum loan amount is ₦${this.criteria.minLoanAmount.toLocaleString()}.`,
        );
      }

      if (application.loanAmount > this.criteria.maxLoanAmount) {
        isEligible = false;
        reasons.push(
          `Requested amount (₦${application.loanAmount.toLocaleString()}) exceeds maximum (₦${this.criteria.maxLoanAmount.toLocaleString()}).`,
        );
        recommendations.push(
          `Maximum loan amount is ₦${this.criteria.maxLoanAmount.toLocaleString()}.`,
        );
      }

      // 7. Get latest vehicle valuation and check LTV ratio
      let vehicleValue = 0;
      try {
        const latestValuation =
          await this.valuationService.getLatestValuationByVehicleId(
            application.vehicleId,
          );
        if (latestValuation) {
          vehicleValue = latestValuation.estimatedValue;
          details.vehicleValue = vehicleValue;

          // Check if valuation is recent (within 30 days)
          const valuationAge =
            Date.now() - new Date(latestValuation.valuationDate).getTime();
          const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000;

          if (valuationAge > thirtyDaysInMs) {
            isEligible = false;
            reasons.push(
              'Vehicle valuation is older than 30 days. A recent valuation is required.',
            );
            recommendations.push('Please request a new vehicle valuation.');
          } else {
            // Calculate LTV ratio (≤ 80%)
            const ltvRatio = application.loanAmount / vehicleValue;
            details.ltvRatio = ltvRatio;

            if (ltvRatio > this.criteria.maxLtvRatio) {
              isEligible = false;
              reasons.push(
                `Loan-to-Value ratio (${(ltvRatio * 100).toFixed(1)}%) exceeds maximum allowed (${this.criteria.maxLtvRatio * 100}%).`,
              );
              recommendations.push(
                `Consider reducing loan amount to ₦${Math.floor(vehicleValue * this.criteria.maxLtvRatio).toLocaleString()} or less.`,
              );
            }
          }
        } else {
          isEligible = false;
          reasons.push(
            'No vehicle valuation found. Vehicle valuation is required for loan processing.',
          );
          recommendations.push(
            'Please request a vehicle valuation before applying for a loan.',
          );
        }
      } catch (valuationError) {
        this.logger.warn(
          `Could not retrieve valuation for vehicle ${application.vehicleId}: ${valuationError.message}`,
        );
        isEligible = false;
        reasons.push(
          'Unable to retrieve vehicle valuation. Valuation is required for loan processing.',
        );
        recommendations.push(
          'Please ensure vehicle valuation is available and try again.',
        );
      }

      // 8. Calculate DTI ratio (≤ 40%)
      const monthlyPayment = this.calculateMonthlyPayment(
        application.loanAmount,
        this.getBaseInterestRate(), // Use base rate for calculation
        application.termMonths,
      );

      const dtiRatio = monthlyPayment / application.monthlyIncome;
      details.dtiRatio = dtiRatio;

      if (dtiRatio > this.criteria.maxDtiRatio) {
        isEligible = false;
        reasons.push(
          `Debt-to-Income ratio (${(dtiRatio * 100).toFixed(1)}%) exceeds maximum allowed (${this.criteria.maxDtiRatio * 100}%).`,
        );
        recommendations.push(
          `Consider reducing loan amount or extending loan term to lower monthly payment below ₦${Math.floor(application.monthlyIncome * this.criteria.maxDtiRatio).toLocaleString()}.`,
        );
      }
    } catch (error) {
      this.logger.error(
        `Error checking eligibility for application ${application.id}:`,
        error.message,
      );
      isEligible = false;
      reasons.push('Unable to complete eligibility check due to system error.');
      recommendations.push('Please try again later or contact support.');
    }

    const eligibilityStatus = isEligible ? 'ELIGIBLE' : 'INELIGIBLE';

    const result: EligibilityResult = {
      isEligible,
      eligibilityStatus,
      reasons: reasons.length > 0 ? reasons : ['All eligibility criteria met.'],
      details,
      recommendations: recommendations.length > 0 ? recommendations : undefined,
    };

    this.logger.log(
      `Eligibility check completed for application ${application.id}. Status: ${eligibilityStatus}`,
    );

    return result;
  }

  private calculateMonthlyPayment(
    principal: number,
    annualRate: number,
    termMonths: number,
  ): number {
    const monthlyRate = annualRate / 12;
    if (monthlyRate === 0) {
      return principal / termMonths;
    }

    const monthlyPayment =
      (principal * (monthlyRate * Math.pow(1 + monthlyRate, termMonths))) /
      (Math.pow(1 + monthlyRate, termMonths) - 1);

    return Math.round(monthlyPayment);
  }

  private getBaseInterestRate(): number {
    // Base interest rate for calculation purposes
    return 0.15; // 15% annual
  }
}
