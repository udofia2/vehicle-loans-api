export interface PaymentCalculation {
  monthlyPayment: number;
  totalPayable: number;
  totalInterest: number;
  effectiveApr: number;
}

export interface InterestRateFactors {
  baseRate: number;
  creditScoreAdjustment?: number;
  ltvAdjustment?: number;
  termAdjustment?: number;
  vehicleAgeAdjustment?: number;
  employmentAdjustment?: string;
}

export interface OfferParameters {
  loanAmount: number;
  baseInterestRate: number;
  termMonths: number;
  vehicleValue?: number;
  vehicleAge?: number;
  employmentStatus?: string;
  creditScore?: number;
}
