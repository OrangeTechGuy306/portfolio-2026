import { NextResponse } from 'next/server';

export interface ApiSuccessResponse<T = any> {
  success: true;
  data?: T;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  errors?: string[];
  message?: string;
}

/**
 * Success response helper
 */
export function successResponse<T>(
  data?: T,
  message?: string,
  pagination?: ApiSuccessResponse['pagination']
): NextResponse<ApiSuccessResponse<T>> {
  const response: ApiSuccessResponse<T> = {
    success: true,
  };

  if (data !== undefined) {
    response.data = data;
  }

  if (message) {
    response.message = message;
  }

  if (pagination) {
    response.pagination = pagination;
  }

  return NextResponse.json(response, { status: 200 });
}

/**
 * Created response helper (201)
 */
export function createdResponse<T>(
  data?: T,
  message?: string
): NextResponse<ApiSuccessResponse<T>> {
  const response: ApiSuccessResponse<T> = {
    success: true,
  };

  if (data !== undefined) {
    response.data = data;
  }

  if (message) {
    response.message = message;
  }

  return NextResponse.json(response, { status: 201 });
}

/**
 * Error response helper
 */
export function errorResponse(
  error: string,
  status: number = 400,
  errors?: string[]
): NextResponse<ApiErrorResponse> {
  const response: ApiErrorResponse = {
    success: false,
    error,
  };

  if (errors && errors.length > 0) {
    response.errors = errors;
  }

  return NextResponse.json(response, { status });
}

/**
 * Validation error response (400)
 */
export function validationError(
  errors: string[],
  message: string = 'Validation failed'
): NextResponse<ApiErrorResponse> {
  return errorResponse(message, 400, errors);
}

/**
 * Unauthorized error response (401)
 */
export function unauthorizedError(
  message: string = 'Unauthorized'
): NextResponse<ApiErrorResponse> {
  return errorResponse(message, 401);
}

/**
 * Forbidden error response (403)
 */
export function forbiddenError(
  message: string = 'Forbidden'
): NextResponse<ApiErrorResponse> {
  return errorResponse(message, 403);
}

/**
 * Not found error response (404)
 */
export function notFoundError(
  message: string = 'Resource not found'
): NextResponse<ApiErrorResponse> {
  return errorResponse(message, 404);
}

/**
 * Server error response (500)
 */
export function serverError(
  message: string = 'Internal server error'
): NextResponse<ApiErrorResponse> {
  return errorResponse(message, 500);
}

/**
 * Calculate pagination metadata
 */
export function calculatePagination(
  page: number,
  limit: number,
  total: number
) {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
}

