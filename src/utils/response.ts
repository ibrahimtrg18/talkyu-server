import { HttpStatus } from '@nestjs/common';
import { Response } from 'express';

export const success = (
  res: Response,
  status: HttpStatus | number,
  { message = '', data = {} },
) => {
  return res.status(status).json({ code: res.statusCode, message, data });
};
