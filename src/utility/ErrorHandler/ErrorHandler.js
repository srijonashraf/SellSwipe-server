export class AppError extends Error {
  constructor(errorCode, details = {}) {
    super(errorCode.message);
    this.statusCode = errorCode.code;
    this.details = details;
  }
}
