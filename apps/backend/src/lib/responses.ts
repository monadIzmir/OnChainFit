// src/lib/responses.ts
export interface SuccessResponse<T> {
  success: true
  data: T
  meta?: {
    page?: number
    limit?: number
    total?: number
    skip?: number
    take?: number
  }
}

export interface ErrorResponse {
  success: false
  error: {
    code: string
    message: string
    details?: Record<string, string[]>
  }
}

export function successResponse<T>(data: T, meta?: SuccessResponse<T>['meta']): SuccessResponse<T> {
  return {
    success: true,
    data,
    meta,
  }
}

export function errorResponse(
  code: string,
  message: string,
  details?: Record<string, string[]>
): ErrorResponse {
  return {
    success: false,
    error: {
      code,
      message,
      details,
    },
  }
}
