export type ErrorResponse = {
  errorType: ErrorType;
  errorMessage: string;
  errors: string[] | null;
  errorRaw: any;
  errorsValidation: ErrorValidation[] | null;
};

export type ErrorType = 'General' | 'Raw' | 'Validation' | 'Unauthorized' | 'Forbidden';

export type ErrorValidation = { [key: string]: string };
