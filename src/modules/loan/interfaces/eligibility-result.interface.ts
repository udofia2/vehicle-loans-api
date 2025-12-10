export interface EligibilityResult {
  isEligible: boolean;
  eligibilityStatus: 'ELIGIBLE' | 'INELIGIBLE' | 'PENDING_CHECK';
  reasons: string[];
  details: {
    ltvRatio?: number;
    dtiRatio?: number;
    vehicleAge?: number;
    monthlyIncome?: number;
    requestedAmount?: number;
    vehicleValue?: number;
    employmentStatus?: string;
    loanTerm?: number;
  };
  recommendations?: string[];
}

export interface EligibilityCheckCriteria {
  maxLtvRatio: number; // 80%
  maxDtiRatio: number; // 40%
  minMonthlyIncome: number; // ₦150,000
  maxVehicleAge: number; // 15 years
  validLoanTerms: number[]; // [12, 24, 36, 48, 60]
  minLoanAmount: number;
  maxLoanAmount: number;
}
