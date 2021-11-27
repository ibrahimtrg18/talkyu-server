import { HttpStatus } from '@nestjs/common';
import { Response } from 'express';

export interface ResponseError {
  status: HttpStatus | number;
  message: string;
}

export interface ResponseSuccess {
  status: HttpStatus | number;
  message: string;
}

export type ResponseResult = [HttpStatus | number, string, any];

export const response = (
  res: Response,
  status: HttpStatus | number,
  message: string,
  data: any,
) => {
  return res.status(status).json({ statusCode: res.statusCode, message, data });
};
