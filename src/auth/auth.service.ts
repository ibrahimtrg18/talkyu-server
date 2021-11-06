import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginGoogleUserDto, LoginUserDto } from 'src/user/dto/login-user.dto';
import { UsersService } from 'src/user/user.service';
import { Payload } from '../interfaces/payload.interface';
import { User } from '../user/entities/user.entity';

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

  async login(
    loginUserDto: LoginUserDto | LoginGoogleUserDto,
  ): Promise<[HttpStatus, { id: string; access_token: string }]> {
    const user = await this.userService.findByLogin(loginUserDto);

    if (!user) {
      return [HttpStatus.UNAUTHORIZED, null];
    }

    const payload = { id: user.id, email: user.email };

    return [
      null,
      {
        id: user.id,
        access_token: this.jwtService.sign(payload),
      },
    ];
  }
}
