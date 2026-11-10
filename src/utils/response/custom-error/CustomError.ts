import { ErrorType, ErrorValidation, ErrorResponse } from './types';

export class CustomError extends Error {
  private httpStatusCode: number;
  private errorType: ErrorType;
  private errors: string[] | null;
  private errorRaw: any;
  private errorsValidation: ErrorValidation[] | null;

  constructor(
    httpStatusCode: number,
    errorType: ErrorType,
    message: string,
    errors: string[] | null = null,
    errorRaw: any = null,
    errorsValidation: ErrorValidation[] | null = null,
  ) {
    super(message);

    this.name = this.constructor.name;

    this.httpStatusCode = httpStatusCode;
    this.errorType = errorType;
    this.errors = errors;
    this.errorRaw = errorRaw;
    this.errorsValidation = errorsValidation;
  }

  get HttpStatusCode() {
    return this.httpStatusCode;
  }

  get ErrorRaw() {
    return this.errorRaw;
  }

  // Database errors (TypeORM QueryFailedError) carry the SQL text, its parameters and driver details.
  // They are logged on the server (see errorHandler) and never sent to the client.
  get isDatabaseError(): boolean {
    const raw = this.errorRaw;
    return Boolean(raw && (raw.name === 'QueryFailedError' || 'query' in raw || 'driverError' in raw));
  }

  get JSON(): ErrorResponse {
    let errorRaw: ErrorResponse['errorRaw'] = null;
    if (this.errorRaw && !this.isDatabaseError) {
      // other raw errors (e.g. JWT "jwt expired") are useful to the client, but only their name and message
      errorRaw = { name: this.errorRaw.name, message: this.errorRaw.message };
    }
    return {
      errorType: this.errorType,
      errorMessage: this.message,
      errors: this.isDatabaseError ? ['Database error, details are in the server log'] : this.errors,
      errorRaw,
      errorsValidation: this.errorsValidation,
    };
  }
}
