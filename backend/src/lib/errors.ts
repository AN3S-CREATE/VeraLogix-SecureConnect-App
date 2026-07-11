export class AppError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly statusCode: number = 400,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized', details?: unknown) {
    super('UNAUTHORIZED', message, 401, details);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden', details?: unknown) {
    super('FORBIDDEN', message, 403, details);
    this.name = 'ForbiddenError';
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Not found', details?: unknown) {
    super('NOT_FOUND', message, 404, details);
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Conflict', details?: unknown) {
    super('CONFLICT', message, 409, details);
    this.name = 'ConflictError';
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Validation failed', details?: unknown) {
    super('VALIDATION_ERROR', message, 422, details);
    this.name = 'ValidationError';
  }
}

export class RateLimitError extends AppError {
  constructor(message = 'Too many requests', details?: unknown) {
    super('RATE_LIMITED', message, 429, details);
    this.name = 'RateLimitError';
  }
}

export class QuotaExceededError extends AppError {
  constructor(message = 'Storage quota exceeded', details?: unknown) {
    super('QUOTA_EXCEEDED', message, 413, details);
    this.name = 'QuotaExceededError';
  }
}

export function isAppError(err: unknown): err is AppError {
  return err instanceof AppError;
}
