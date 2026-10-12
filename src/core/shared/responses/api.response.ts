/**
 * System-Wide API Response Format
 *
 * Defines the unified response structure for ALL API endpoints.
 * This is infrastructure/system-level concern, not business logic.
 */
import type { Response } from 'express';

export const ApiResponse = {
  /**
   * Create a successful response (200)
   */
  success<T>(data: T, response: Response, message?: string) {
    const responseData = {
      success: true,
      message: message ?? 'Operation completed successfully',
      data,
      timestamp: new Date().toISOString(),
    };
    response.status(200).json(responseData);
  },

  /**
   * Create a paginated response (200)
   */
  paginated<T>(
    data: T[],
    total: number,
    page: number,
    limit: number,
    response: Response,
    message?: string
  ) {
    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    const responseData = {
      success: true,
      message: message ?? 'Data retrieved successfully',
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNext,
        hasPrev,
      },
      timestamp: new Date().toISOString(),
    };

    response.status(200).json(responseData);
  },

  /**
   * Create a created response (201)
   */
  created<T>(data: T, response: Response, message?: string) {
    const responseData = {
      success: true,
      message: message ?? 'Resource created successfully',
      data,
      timestamp: new Date().toISOString(),
    };

    response.status(201).json(responseData);
  },
};
