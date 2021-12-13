import { CanActivate, Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { Observable } from 'rxjs';

import { Payload } from '../interfaces/payload.interface';
import { UsersService } from '../user/user.service';
import { jwtConstants } from './constants';

@Injectable()
export class WsGuard implements CanActivate {
  constructor(private userService: UsersService) {}
  canActivate(
    context: any,
  ): boolean | any | Promise<boolean | any> | Observable<boolean | any> {
    try {
      return new Promise((resolve, reject) => {
        const client = context.switchToWs().getClient();

        const bearerToken = client.handshake.headers.authorization.split(
          ' ',
        )[1];
        if (!bearerToken) {
          reject('Invalid Bearer');
        }
        const decoded = jwt.verify(bearerToken, jwtConstants.secret) as Payload;
        return this.userService
          .findOneById(decoded.id)
          .then(([status, message, user]) => {
            if (user) {
              context.switchToWs().getData().user = user;
              resolve(true);
            } else {
              reject(false);
            }
          });
      });
    } catch (e) {
      console.error(e);
      return false;
    }
  }
}
