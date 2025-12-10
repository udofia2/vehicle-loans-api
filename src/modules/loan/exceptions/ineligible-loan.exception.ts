import { BadRequestException } from '@nestjs/common';

export class IneligibleLoanException extends BadRequestException {
  constructor(reasons: string[], details?: any) {
    const message = `Loan application is ineligible: ${reasons.join(', ')}`;
    super({
      message,
      error: 'Loan Ineligible',
      statusCode: 422,
      reasons,
      details,
    });
  }
}
