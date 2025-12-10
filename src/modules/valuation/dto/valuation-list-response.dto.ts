import { ApiProperty } from '@nestjs/swagger';
import { PaginatedResponse } from '../../../common/types';
import { ValuationResponseDto } from './valuation-response.dto';

export class ValuationListResponseDto implements PaginatedResponse<ValuationResponseDto> {
  @ApiProperty({
    description: 'List of valuations',
    type: [ValuationResponseDto],
  })
  data: ValuationResponseDto[];

  @ApiProperty({
    description: 'Total number of records',
    example: 100,
  })
  total: number;

  @ApiProperty({
    description: 'Current page number',
    example: 1,
  })
  page: number;

  @ApiProperty({
    description: 'Number of records per page',
    example: 10,
  })
  limit: number;

  @ApiProperty({
    description: 'Total number of pages',
    example: 10,
  })
  totalPages: number;

  static fromPaginatedResponse(
    paginatedResponse: PaginatedResponse<any>,
  ): ValuationListResponseDto {
    const response = new ValuationListResponseDto();
    response.data = ValuationResponseDto.fromEntities(paginatedResponse.data);
    response.total = paginatedResponse.total;
    response.page = paginatedResponse.page;
    response.limit = paginatedResponse.limit;
    response.totalPages = paginatedResponse.totalPages;
    return response;
  }
}
