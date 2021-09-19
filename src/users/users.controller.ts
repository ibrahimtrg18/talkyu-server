import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Res,
  HttpStatus,
  UseGuards,
  Req,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Response, Request } from 'express';
import { response } from '../utils/response';
import { Query } from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';
import { LoginUserDto } from './dto/login-user.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { OAuth2Client } from 'google-auth-library';
import { SearchUserDto } from './dto/search-user.dto';
import { Payload } from 'src/interfaces/payload.interface';
import { User } from 'src/decorators/user.decorator';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {}

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto, @Res() res: Response) {
    try {
      const [error, newUser] = await this.usersService.register(createUserDto);

      if (error) {
        return response(res, error, {
          message: 'Email is already register!',
          data: newUser,
        });
      }

      return response(res, HttpStatus.CREATED, {
        message: 'Succesfully register new account',
        data: newUser,
      });
    } catch (e) {
      return response(res, HttpStatus.INTERNAL_SERVER_ERROR, {
        message: e,
        data: null,
      });
    }
  }

  @Post('login')
  async login(@Body() loginUserDto: LoginUserDto, @Res() res: Response) {
    try {
      const token = await this.authService.login(loginUserDto);

      return response(res, HttpStatus.OK, {
        message: 'Successfully Login',
        data: token,
      });
    } catch (e) {
      return response(res, HttpStatus.INTERNAL_SERVER_ERROR, {
        message: e,
        data: null,
      });
    }
  }

  @Post('google/register')
  async registerGoogle(@Req() req: Request, @Res() res: Response) {
    try {
      const client = new OAuth2Client({
        clientId:
          '39515346365-ffck4nfekkjo1uv5trfefc08taqjorq7.apps.googleusercontent.com',
        clientSecret: '4ppH-HYbJY0ag8u_Sn7dypeh',
      });
      const ticket = await client.verifyIdToken({
        idToken: req.headers['token'] as string,
        audience:
          '39515346365-ffck4nfekkjo1uv5trfefc08taqjorq7.apps.googleusercontent.com',
      });
      const payload = ticket.getPayload();

      const [error, newUser] = await this.usersService.registerGoogle({
        email: payload.email,
        name: payload.name,
        googleOpenId: payload.sub,
      });

      if (error) {
        return response(res, error, {
          message: 'Email is already register!',
          data: newUser,
        });
      }

      return response(res, HttpStatus.CREATED, {
        message: 'Succesfully register new account',
        data: newUser,
      });
    } catch (e) {
      return response(res, HttpStatus.INTERNAL_SERVER_ERROR, {
        message: e,
        data: null,
      });
    }
  }

  @Post('google/login')
  async loginGoogle(@Req() req: Request, @Res() res: Response) {
    try {
      const client = new OAuth2Client({
        clientId:
          '39515346365-ffck4nfekkjo1uv5trfefc08taqjorq7.apps.googleusercontent.com',
        clientSecret: '4ppH-HYbJY0ag8u_Sn7dypeh',
      });
      const ticket = await client.verifyIdToken({
        idToken: req.headers['token'] as string,
        audience:
          '39515346365-ffck4nfekkjo1uv5trfefc08taqjorq7.apps.googleusercontent.com',
      });
      const payload = ticket.getPayload();

      const [error, newUser] = await this.usersService.registerGoogle({
        email: payload.email,
        name: payload.name,
        googleOpenId: payload.sub,
      });

      if (error) {
        const token = await this.authService.login({ email: payload.email });

        return response(res, HttpStatus.OK, {
          message: 'Successfully Login',
          data: token,
        });
      } else {
        const token = await this.authService.login({ email: newUser.email });

        return response(res, HttpStatus.OK, {
          message: 'Successfully Login',
          data: token,
        });
      }
    } catch (e) {
      return response(res, HttpStatus.INTERNAL_SERVER_ERROR, {
        message: e,
        data: null,
      });
    }
  }

  @UseGuards(JwtAuthGuard)
  @Patch()
  async update(
    @Res() res: Response,
    @Body() updateUserDto: UpdateUserDto,
    @User() user: Payload,
  ) {
    try {
      if (!updateUserDto.password) {
        return response(res, HttpStatus.BAD_REQUEST, {
          message: 'Password is required!',
        });
      }

      const [error, newUser] = await this.usersService.updateAccount(
        user.id,
        updateUserDto,
      );

      if (error === HttpStatus.FORBIDDEN) {
        return response(res, error, {
          message: 'Password is incorrect!',
          data: newUser,
        });
      }

      if (error === HttpStatus.NOT_FOUND) {
        return response(res, error, {
          message: "Sorry, We can't find your account!",
          data: newUser,
        });
      }

      return response(res, HttpStatus.OK, {
        message: 'Succesfully register new account',
        data: newUser,
      });
    } catch (e) {
      return response(res, HttpStatus.INTERNAL_SERVER_ERROR, {
        message: e,
        data: null,
      });
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('account')
  async account(@Req() req: Request, @Res() res: Response) {
    try {
      return response(res, HttpStatus.OK, {
        message: 'Successfully data account',
        data: req.user,
      });
    } catch (e) {
      return response(res, HttpStatus.INTERNAL_SERVER_ERROR, {
        message: e,
        data: null,
      });
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('friend')
  async friend(@Res() res: Response, @User() user: Payload) {
    try {
      const friends = await this.usersService.getFriends(user.id);

      return response(res, HttpStatus.OK, {
        message: `You have ${friends.length} friends`,
        data: friends,
      });
    } catch (e) {
      return response(res, HttpStatus.INTERNAL_SERVER_ERROR, {
        message: e,
        data: null,
      });
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('conversation')
  async conversations(@Res() res: Response, @User() user: Payload) {
    try {
      const conversations = await this.usersService.getConversations(user.id);

      return response(res, HttpStatus.OK, {
        message: `You have ${conversations.length} conversations`,
        data: conversations,
      });
    } catch (e) {
      return response(res, HttpStatus.INTERNAL_SERVER_ERROR, {
        message: e,
        data: null,
      });
    }
  }

  @Get('search')
  async search(@Res() res: Response, @Query() searchUserDto: SearchUserDto) {
    try {
      const results = await this.usersService.findByQuery(searchUserDto);

      return response(res, HttpStatus.OK, { data: results });
    } catch (e) {
      return response(res, HttpStatus.INTERNAL_SERVER_ERROR, {
        message: e,
        data: null,
      });
    }
  }

  @Get(':id')
  findOneById(@Res() res: Response, @Param('id') id: string) {
    try {
      return this.usersService.findOneById(id);
    } catch (e) {
      return response(res, HttpStatus.INTERNAL_SERVER_ERROR, {
        message: e,
        data: null,
      });
    }
  }
}
