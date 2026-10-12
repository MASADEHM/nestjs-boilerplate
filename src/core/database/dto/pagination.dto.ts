import { DEFAULTS } from '@core/shared/constants';
import { Transform, Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class PaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Transform(({ value }) => {
    if (typeof value === 'string' || typeof value === 'number') {
      const parsed = Number.parseInt(String(value), 10);
      return Number.isNaN(parsed) || parsed === 0 ? 1 : parsed;
    }
    return 1;
  })
  public page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @Transform(({ value }) => {
    if (typeof value === 'string' || typeof value === 'number') {
      const parsed = Number.parseInt(String(value), 10);
      return Number.isNaN(parsed) || parsed === 0
        ? DEFAULTS.PAGINATION_LIMIT
        : parsed;
    }
    return DEFAULTS.PAGINATION_LIMIT;
  })
  public limit?: number = DEFAULTS.PAGINATION_LIMIT;

  // Computed property for pagination skip
  public get skip(): number {
    const pageValue = this.page ?? 1;
    const limitValue = this.limit ?? DEFAULTS.PAGINATION_LIMIT;
    return (pageValue - 1) * limitValue;
  }
}
