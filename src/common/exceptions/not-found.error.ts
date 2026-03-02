import { AppError } from './app-error';

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found', details?: unknown) {
    super(message, 'NOT_FOUND', 404, details);
  }
}
