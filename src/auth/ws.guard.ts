import {
  CanActivate,
  ExecutionContext,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import * as jwt from 'jsonwebtoken';
import { Observable } from 'rxjs';

import { UserService } from '../user/user.service';
import { response } from '../utils/response';
import { jwtConstants } from './constants';

@Injectable()
export class WsGuard implements CanActivate {
  constructor(private reflector: Reflector, private userService: UserService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    return new Promise((resolve, reject) => {
      const event = this.reflector.get<string[]>('event', context.getHandler());

      if (!event) {
        return resolve(true);
      }

      const client = context.switchToWs().getClient();
      const authorization = client.handshake.headers.authorization;
      const bearerToken = authorization.split(' ')[1];

      if (!bearerToken) {
        return reject(false);
      }

      jwt.verify(bearerToken, jwtConstants.secret, (error, decoded) => {
        if (error) {
          client.emit(event, response(null, undefined, error.message, null));
          return reject(false);
        }

        this.userService.findOneById(decoded.id).then((user) => {
          if (user) {
            context.switchToWs().getData().user = user;
            return resolve(true);
          } else {
            if (!user) {
              client.emit(
                event,
                response(
                  null,
                  HttpStatus.NOT_FOUND,
                  'Failed: User not found!',
                  user,
                ),
              );
            }
            client.emit(
              event,
              response(null, HttpStatus.OK, 'Failed: User correct!', user),
            );
            return reject(false);
          }
        });
      });
    });
  }
}
