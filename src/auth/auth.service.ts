import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { Payload } from '../interfaces/payload.interface';
import { LoginToken, LoginUserDto } from '../user/dto/login-user.dto';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async validateUser(payload: Payload): Promise<Payload> {
    const user = await this.userService.findOneById(payload.id);

    if (user) {
      const { password, ...result } = user;
      return result;
    }

    return null;
  }

  async login(loginUserDto: LoginUserDto) {
    const user = await this.userService.findByLogin(loginUserDto);

    if (!user) {
      return null;
    }

    const payload = { id: user.id, email: user.email };

    return {
      id: user.id,
      access_token: this.jwtService.sign(payload),
    };
  }

  async loginGoogle({ email, google_open_id }) {
    const user = await this.userService.findByGoogleAccount(
      email,
      google_open_id,
    );

    if (!user) {
      return null;
    }

    const payload = { id: user.id, email: user.email };

    return {
      id: user.id,
      access_token: this.jwtService.sign(payload),
    };
  }

  async token(loginUserDto: LoginToken) {
    const { id } = await this.jwtService.verify(loginUserDto.token);

    const user = await this.userService.findOneById(id);

    if (!user) {
      return null;
    }

    const payload = { id: user.id, email: user.email };

    return {
      id: user.id,
      access_token: this.jwtService.sign(payload),
    };
  }
}
