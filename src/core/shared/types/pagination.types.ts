export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedResponse<T> extends PaginationMeta {
  data: T[];
}

export class PaginatedResponseBaseSchema {
  public total: number;

  public page: number;

  public limit: number;

  public totalPages: number;

  public hasNext: boolean;

  public hasPrev: boolean;
}
