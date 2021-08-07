import { HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';

export const response = (
  res: Response,
  status: HttpStatus | number,
  { message = '', data = null },
) => {
  return res.status(status).json({ statusCode: res.statusCode, message, data });
};
