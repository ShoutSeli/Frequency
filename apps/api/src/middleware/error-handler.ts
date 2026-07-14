import { NextFunction, Request, Response } from 'express';

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ApiError) {
    return res.status(err.status).json({ message: err.message });
  }
  console.error('[unhandled error]', err);
  return res.status(500).json({ message: 'Something went wrong. Please try again.' });
}

export function notFoundHandler(_req: Request, res: Response) {
  res.status(404).json({ message: 'Route not found.' });
}
