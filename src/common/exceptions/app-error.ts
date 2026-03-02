export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly status: number,
    public readonly details?: unknown,
  ) {
    super(message);

    this.name = 'AppError';

    // фикс наследования для Error
    Object.setPrototypeOf(this, new.target.prototype);

    // нормальный stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
