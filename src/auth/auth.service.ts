import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginGoogleUserDto, LoginUserDto } from 'src/user/dto/login-user.dto';
import { UsersService } from 'src/user/user.service';
import { Payload } from '../interfaces/payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
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

  async login(loginUserDto: LoginUserDto | LoginGoogleUserDto) {
    const user = await this.userService.findByLogin(loginUserDto);

    if (!user) {
      throw new HttpException(
        'Email and Password incorrect!',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const payload = { id: user.id, email: user.email };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
