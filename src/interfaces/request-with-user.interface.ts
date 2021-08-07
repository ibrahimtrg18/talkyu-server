import { Request } from 'express';
import { Payload } from './payload.interface';

export interface RequestWithUser extends Request {
  user: Payload;
}
