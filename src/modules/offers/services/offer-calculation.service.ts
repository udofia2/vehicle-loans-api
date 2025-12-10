import { Injectable, Logger } from '@nestjs/common';
import {
  PaymentCalculation,
  InterestRateFactors,
  OfferParameters,
} from '../interfaces/payment-calculation.interface';

@Injectable()
export class OfferCalculationService {
  private readonly logger = new Logger(OfferCalculationService.name);

  // Base interest rates by loan term (annual rates)
  private readonly baseRates = {
    12: 0.12, // 12% for 1 year
    24: 0.14, // 14% for 2 years
    36: 0.15, // 15% for 3 years
    48: 0.16, // 16% for 4 years
    60: 0.18, // 18% for 5 years
  };

  /**
   * Calculate monthly payment using loan payment formula
   * Formula: M = P * (r(1+r)^n) / ((1+r)^n - 1)
   * Where: M = Monthly payment, P = Principal, r = Monthly interest rate, n = Number of payments
   */
  calculateMonthlyPayment(
    principal: number,
    annualRate: number,
    termMonths: number,
  ): number {
    this.logger.debug(
      `Calculating monthly payment: Principal=₦${principal.toLocaleString()}, Rate=${(annualRate * 100).toFixed(2)}%, Term=${termMonths} months`,
    );

    if (principal <= 0 || annualRate < 0 || termMonths <= 0) {
      throw new Error('Invalid payment calculation parameters');
    }

    const monthlyRate = annualRate / 12;

    // Handle zero interest rate case
    if (monthlyRate === 0) {
      return Math.round(principal / termMonths);
    }

    const monthlyPayment =
      (principal * (monthlyRate * Math.pow(1 + monthlyRate, termMonths))) /
      (Math.pow(1 + monthlyRate, termMonths) - 1);

    const result = Math.round(monthlyPayment);
    this.logger.debug(
      `Calculated monthly payment: ₦${result.toLocaleString()}`,
    );

    return result;
  }

  /**
   * Calculate total payable amount over loan term
   */
  calculateTotalPayable(monthlyPayment: number, termMonths: number): number {
    const total = monthlyPayment * termMonths;
    this.logger.debug(
      `Calculated total payable: ₦${total.toLocaleString()} (${monthlyPayment.toLocaleString()} × ${termMonths})`,
    );
    return total;
  }

  /**
   * Adjust interest rate based on various risk factors
   */
  adjustInterestRate(baseRate: number, factors: InterestRateFactors): number {
    this.logger.debug(
      `Adjusting base rate ${(baseRate * 100).toFixed(2)}% with factors:`,
      factors,
    );

    let adjustedRate = baseRate;

    // LTV ratio adjustment (higher LTV = higher rate)
    if (factors.ltvAdjustment) {
      const ltvRate = factors.ltvAdjustment;
      if (ltvRate > 0.75) {
        adjustedRate += 0.02; // +2% for high LTV
      } else if (ltvRate > 0.6) {
        adjustedRate += 0.01; // +1% for medium LTV
      }
      // No adjustment for LTV <= 60%
    }

    // Vehicle age adjustment (older vehicles = higher rate)
    if (factors.vehicleAgeAdjustment) {
      const vehicleAge = factors.vehicleAgeAdjustment;
      if (vehicleAge > 10) {
        adjustedRate += 0.03; // +3% for very old vehicles
      } else if (vehicleAge > 5) {
        adjustedRate += 0.015; // +1.5% for older vehicles
      }
      // No adjustment for vehicles <= 5 years
    }

    // Employment status adjustment
    if (factors.employmentAdjustment) {
      switch (factors.employmentAdjustment.toLowerCase()) {
        case 'self_employed':
          adjustedRate += 0.015; // +1.5% for self-employed
          break;
        case 'retired':
          adjustedRate += 0.01; // +1% for retired
          break;
        case 'employed':
        default:
          // No adjustment for employed
          break;
      }
    }

    // Credit score adjustment (if available)
    if (factors.creditScoreAdjustment) {
      const creditScore = factors.creditScoreAdjustment;
      if (creditScore < 600) {
        adjustedRate += 0.04; // +4% for poor credit
      } else if (creditScore < 700) {
        adjustedRate += 0.02; // +2% for fair credit
      } else if (creditScore > 800) {
        adjustedRate -= 0.01; // -1% for excellent credit
      }
      // No adjustment for credit scores 700-800 (good credit)
    }

    // Term adjustment is already built into base rates

    // Ensure rate doesn't go below minimum (5%) or above maximum (30%)
    const finalRate = Math.max(0.05, Math.min(0.3, adjustedRate));

    this.logger.debug(
      `Adjusted interest rate: ${(finalRate * 100).toFixed(2)}% (change: ${((finalRate - baseRate) * 100).toFixed(2)}%)`,
    );

    return finalRate;
  }

  /**
   * Calculate complete payment details for an offer
   */
  calculateOfferDetails(params: OfferParameters): PaymentCalculation {
    this.logger.log(
      `Calculating offer details for loan amount: ₦${params.loanAmount.toLocaleString()}, term: ${params.termMonths} months`,
    );

    // Get base rate for the term
    const baseRate =
      this.baseRates[params.termMonths] || params.baseInterestRate;

    // Build interest rate adjustment factors
    const factors: InterestRateFactors = {
      baseRate,
    };

    if (params.vehicleValue && params.loanAmount) {
      factors.ltvAdjustment = params.loanAmount / params.vehicleValue;
    }

    if (params.vehicleAge) {
      factors.vehicleAgeAdjustment = params.vehicleAge;
    }

    if (params.employmentStatus) {
      factors.employmentAdjustment = params.employmentStatus;
    }

    if (params.creditScore) {
      factors.creditScoreAdjustment = params.creditScore;
    }

    // Calculate adjusted interest rate
    const adjustedRate = this.adjustInterestRate(baseRate, factors);

    // Calculate payment details
    const monthlyPayment = this.calculateMonthlyPayment(
      params.loanAmount,
      adjustedRate,
      params.termMonths,
    );

    const totalPayable = this.calculateTotalPayable(
      monthlyPayment,
      params.termMonths,
    );
    const totalInterest = totalPayable - params.loanAmount;
    const effectiveApr = adjustedRate; // For simplicity, using same as interest rate

    const calculation: PaymentCalculation = {
      monthlyPayment,
      totalPayable,
      totalInterest,
      effectiveApr,
    };

    this.logger.log(
      `Offer calculation completed: Monthly=₦${monthlyPayment.toLocaleString()}, Total=₦${totalPayable.toLocaleString()}, Interest=₦${totalInterest.toLocaleString()}, APR=${(effectiveApr * 100).toFixed(2)}%`,
    );

    return calculation;
  }

  /**
   * Get base interest rate for a given loan term
   */
  getBaseRateForTerm(termMonths: number): number {
    const rate = this.baseRates[termMonths];
    if (!rate) {
      this.logger.warn(
        `No base rate configured for ${termMonths} months term, using default 15%`,
      );
      return 0.15;
    }
    return rate;
  }

  /**
   * Calculate loan affordability - maximum loan amount for given monthly payment capacity
   */
  calculateMaxLoanAmount(
    monthlyPaymentCapacity: number,
    annualRate: number,
    termMonths: number,
  ): number {
    this.logger.debug(
      `Calculating max loan for payment capacity: ₦${monthlyPaymentCapacity.toLocaleString()}`,
    );

    const monthlyRate = annualRate / 12;

    if (monthlyRate === 0) {
      return monthlyPaymentCapacity * termMonths;
    }

    const maxLoan =
      (monthlyPaymentCapacity * (Math.pow(1 + monthlyRate, termMonths) - 1)) /
      (monthlyRate * Math.pow(1 + monthlyRate, termMonths));

    const result = Math.floor(maxLoan);
    this.logger.debug(`Maximum affordable loan: ₦${result.toLocaleString()}`);

    return result;
  }

  /**
   * Generate payment schedule (for future use)
   */
  generatePaymentSchedule(
    principal: number,
    annualRate: number,
    termMonths: number,
  ): Array<{
    paymentNumber: number;
    paymentAmount: number;
    principalAmount: number;
    interestAmount: number;
    remainingBalance: number;
  }> {
    const monthlyPayment = this.calculateMonthlyPayment(
      principal,
      annualRate,
      termMonths,
    );
    const monthlyRate = annualRate / 12;
    const schedule = [];
    let remainingBalance = principal;

    for (let i = 1; i <= termMonths; i++) {
      const interestAmount = Math.round(remainingBalance * monthlyRate);
      const principalAmount = monthlyPayment - interestAmount;
      remainingBalance -= principalAmount;

      schedule.push({
        paymentNumber: i,
        paymentAmount: monthlyPayment,
        principalAmount,
        interestAmount,
        remainingBalance: Math.max(0, remainingBalance),
      });
    }

    return schedule;
  }
}
