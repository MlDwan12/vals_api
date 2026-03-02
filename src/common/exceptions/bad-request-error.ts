import { AppError } from './app-error';

export class BadRequestAppError extends AppError {
  constructor(message: string = 'Bad Request', details?: unknown) {
    super(message, 'BAD_REQUEST', 400, details);
  }
}
