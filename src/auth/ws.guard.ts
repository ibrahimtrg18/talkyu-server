import * as jwt from 'jsonwebtoken';
import { CanActivate, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { UsersService } from 'src/users/users.service';
import { jwtConstants } from './constants';
import { Payload } from 'src/interfaces/payload.interface';

@Injectable()
export class WsGuard implements CanActivate {
  constructor(private usersService: UsersService) {}
  canActivate(
    context: any,
  ): boolean | any | Promise<boolean | any> | Observable<boolean | any> {
    try {
      const client = context.switchToWs().getClient();

      const bearerToken = client.handshake.headers.authorization.split(' ')[1];
      if (!bearerToken) {
        return false;
      }
      const decoded = jwt.verify(bearerToken, jwtConstants.secret) as Payload;
      return new Promise((resolve, reject) => {
        return this.usersService.findOneById(decoded.id).then((user) => {
          if (user) {
            context.switchToWs().getData().user = user;
            resolve(true);
          } else {
            reject(false);
          }
        });
      });
    } catch (e) {
      console.log(e);
      return false;
    }
  }
}
