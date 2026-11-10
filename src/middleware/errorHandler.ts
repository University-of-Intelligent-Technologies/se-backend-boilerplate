import { Request, Response, NextFunction } from 'express';

import { CustomError } from '../utils/response/custom-error/CustomError';

export const errorHandler = (err: CustomError | Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof CustomError) {
    return res.status(err.HttpStatusCode).json(err.JSON);
  }

  // Errors that did not go through CustomError, e.g. malformed JSON in the request body (body-parser sets
  // `status: 400`) or an unexpected exception. Answer with the same JSON shape and never send the stack trace.
  const status = Number((err as any).status ?? (err as any).statusCode) || 500;
  if (status >= 500) {
    console.error(err);
  }
  return res.status(status).json({
    errorType: 'General',
    errorMessage: status >= 500 ? 'Internal Server Error' : err.message,
    errors: null,
    errorRaw: null,
    errorsValidation: null,
  });
};
