import { ApiResponse } from '@core/shared/responses/api.response';

import type { PaginatedResponse } from '@core/shared/types';
import type { Response } from 'express';

/**
 * System-Wide Response Helper
 *
 * Infrastructure utility that enhances the core ApiResponse with i18n support.
 * This is system-level infrastructure, not business logic.
 */
export const ResponseHelper = {
  // ===== SUCCESS RESPONSES =====

  success<T>(
    data: T,
    response: Response,
    message?: string | Record<string, unknown>
  ) {
    const finalMessage =
      typeof message === 'string'
        ? message
        : 'Operation completed successfully';
    ApiResponse.success(data, response, finalMessage);
  },

  created<T>(
    data: T,
    response: Response,
    message?: string | Record<string, unknown>
  ) {
    const finalMessage =
      typeof message === 'string' ? message : 'Resource created successfully';
    ApiResponse.created(data, response, finalMessage);
  },

  paginated<T>(
    paginatedData: PaginatedResponse<T>,
    response: Response,
    message?: string | Record<string, unknown>
  ) {
    const finalMessage =
      typeof message === 'string' ? message : 'Data retrieved successfully';
    ApiResponse.paginated(
      paginatedData.data,
      paginatedData.total,
      paginatedData.page,
      paginatedData.limit,
      response,
      finalMessage
    );
  },
};
