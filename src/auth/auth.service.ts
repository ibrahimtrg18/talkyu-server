import { HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  LoginGoogleUserDto,
  LoginToken,
  LoginUserDto,
} from 'src/user/dto/login-user.dto';
import { UsersService } from 'src/user/user.service';
import { ResponseResult } from 'src/utils/response';
import { Payload } from '../interfaces/payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(payload: Payload): Promise<Payload> {
    const [error, message, user] = await this.userService.findOneById(
      payload.id,
    );
    if (user) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(
    loginUserDto: LoginUserDto | LoginGoogleUserDto,
  ): Promise<ResponseResult> {
    const user = await this.userService.findByLogin(loginUserDto);

    if (!user) {
      return [HttpStatus.UNAUTHORIZED, 'Email and Password incorrect!', null];
    }

    const payload = { id: user.id, email: user.email };

    return [
      HttpStatus.OK,
      'Successfully Login!',
      {
        id: user.id,
        access_token: this.jwtService.sign(payload),
      },
    ];
  }

  async token(loginUserDto: LoginToken): Promise<ResponseResult> {
    const { id } = await this.jwtService.verify(loginUserDto.token);
    console.log(id);

    const [error, message, user] = await this.userService.findOneById(id);

    if (!user) {
      return [HttpStatus.UNAUTHORIZED, 'Invalid Token!', null];
    }

    const payload = { id: user.id, email: user.email };

    return [
      HttpStatus.UNAUTHORIZED,
      'Successfully get token!',
      {
        id: user.id,
        access_token: this.jwtService.sign(payload),
      },
    ];
  }
}
