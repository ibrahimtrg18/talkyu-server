import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { OAuth2Client } from 'google-auth-library';
import { diskStorage } from 'multer';
import * as path from 'path';

import { AuthService } from '../auth/auth.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { User } from '../decorators/user.decorator';
import { Payload } from '../interfaces/payload.interface';
import { createFile, getFile, getFileToBase64 } from '../utils/file';
import { response } from '../utils/response';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginGoogleUserDto, LoginUserDto } from './dto/login-user.dto';
import { SearchUserDto } from './dto/search-user.dto';
import { TokenUserDto } from './dto/token-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateUserAvatarDto } from './dto/update-user-avatar.dto';
import { UsersService } from './user.service';

@ApiTags('user')
@Controller('user')
export class UsersController {
  constructor(
    private readonly userService: UsersService,
    private readonly authService: AuthService,
  ) {}

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto, @Res() res: Response) {
    try {
      const [status, message, newUser] = await this.userService.register(
        createUserDto,
      );

      return response(res, status, message, newUser);
    } catch (e) {
      console.error(e);
      return response(res, HttpStatus.INTERNAL_SERVER_ERROR, e, null);
    }
  }

  @Post('login')
  async login(@Body() loginUserDto: LoginUserDto, @Res() res: Response) {
    try {
      const [status, message, token] = await this.authService.login(
        loginUserDto,
      );

      return response(res, status, message, token);
    } catch (e) {
      console.error(e);
      return response(res, HttpStatus.INTERNAL_SERVER_ERROR, e, null);
    }
  }

  @Post('google/register')
  async registerGoogle(@Req() req: Request, @Res() res: Response) {
    try {
      const client = new OAuth2Client({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        redirectUri: process.env.GOOGLE_REDIRECT_URI,
        forceRefreshOnFailure: true,
      });
      client.generateAuthUrl({
        access_type: 'offline',
        scope: [
          'https://www.googleapis.com/auth/userinfo.email',
          'https://www.googleapis.com/auth/userinfo.profile',
          'openid',
        ],
      });
      const ticket = await client.verifyIdToken({
        idToken: req.headers['token'] as string,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();

      const [status, message, newUser] = await this.userService.registerGoogle({
        email: payload.email,
        name: payload.name,
        google_open_id: payload.sub,
      });

      return response(res, status, message, newUser);
    } catch (e) {
      console.error(e);
      return response(res, HttpStatus.INTERNAL_SERVER_ERROR, e, null);
    }
  }

  @Post('google/login')
  async loginGoogle(
    @Req() req: Request,
    @Body() loginGoogleUserDto: LoginGoogleUserDto,
    @Res() res: Response,
  ) {
    try {
      const client = new OAuth2Client({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        redirectUri: process.env.GOOGLE_REDIRECT_URI,
      });
      client.generateAuthUrl({
        access_type: 'offline',
        scope: [
          'https://www.googleapis.com/auth/userinfo.email',
          'https://www.googleapis.com/auth/userinfo.profile',
          'openid',
        ],
      });

      const r = await client.getToken(loginGoogleUserDto.serverAuthCode);

      if (!r.tokens.access_token) {
        console.error(r.res.statusText);
        return response(res, r.res.status, r.res.statusText, null);
      }

      const ticket = await client.verifyIdToken({
        idToken: r.tokens.id_token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();

      // register account with google
      const [status, message, newUser] = await this.userService.registerGoogle({
        email: payload.email,
        name: payload.name,
        google_open_id: payload.sub,
      });

      if (status === HttpStatus.CONFLICT) {
        const [status, message, user] = await this.authService.loginGoogle({
          email: payload.email,
          google_open_id: payload.sub,
        });

        return response(res, status, message, user);
      } else {
        const [status, message, user] = await this.authService.loginGoogle({
          email: payload.email,
          google_open_id: payload.sub,
        });
        return response(res, status, message, user);
      }
    } catch (e) {
      console.error(e);
      return response(res, HttpStatus.INTERNAL_SERVER_ERROR, e, null);
    }
  }

  // @UseGuards(JwtAuthGuard)
  @Post('token')
  async token(
    @Res() res: Response,
    @Body() tokenUserDto: TokenUserDto,
    @User() user: Payload,
  ) {
    try {
      console.log(tokenUserDto);
      const [status, message, token] = await this.authService.token({
        token: tokenUserDto.token,
      });

      return response(res, status, message, token);
    } catch (e) {
      console.error(e);
      return response(res, HttpStatus.INTERNAL_SERVER_ERROR, e, null);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Patch('account')
  async update(
    @Res() res: Response,
    @Body() updateUserDto: UpdateUserDto,
    @User() user: Payload,
  ) {
    try {
      if (!updateUserDto.confirmPassword) {
        return response(
          res,
          HttpStatus.BAD_REQUEST,
          'Password is required!',
          null,
        );
      }

      const [
        status,
        message,
        updatedUser,
      ] = await this.userService.updateAccount(user.id, updateUserDto);

      return response(res, status, message, updatedUser);
    } catch (e) {
      console.error(e);
      return response(res, HttpStatus.INTERNAL_SERVER_ERROR, e, null);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('account')
  async account(@User() user: Payload, @Res() res: Response) {
    try {
      return response(res, HttpStatus.OK, 'Successfully data account!', user);
    } catch (e) {
      console.error(e);
      return response(res, HttpStatus.INTERNAL_SERVER_ERROR, e, null);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Patch('account/avatar')
  async updateAvatar(
    @User() user: Payload,
    @Body() updateUserAvatarDto: UpdateUserAvatarDto,
    @Res() res: Response,
  ) {
    try {
      const { file } = updateUserAvatarDto;

      const filename = await createFile(file, {
        prefix: ['uploads', 'user', 'avatar'],
        name: `${user.id}-${Date.now()}`,
      });

      await this.userService.updateAvatar(user.id, filename);

      return response(res, HttpStatus.OK, 'Successfully update avatar!', null);
    } catch (e) {
      console.error(e);
      return response(res, HttpStatus.INTERNAL_SERVER_ERROR, e, null);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('account/avatar')
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: diskStorage({
        destination: './public/uploads/user/avatar/',
        filename: function (req: Request, file, cb) {
          const { id } = req.user as Payload;
          cb(null, `${id}-${Date.now()}${path.extname(file.originalname)}`);
        },
      }),
      fileFilter: function (req: Request, file, cb) {
        if (
          file.mimetype !== 'image/png' &&
          file.mimetype !== 'image/jpg' &&
          file.mimetype !== 'image/jpeg'
        ) {
          return cb(new Error('Extension not allowed'), false);
        }
        return cb(null, true);
      },
    }),
  )
  async uploadAvatar(
    @Res() res: Response,
    @UploadedFile() file: Express.Multer.File,
    @User() user: Payload,
  ) {
    try {
      if (!file) {
        return response(
          res,
          HttpStatus.BAD_REQUEST,
          "File key: 'avatar' is required!",
          null,
        );
      }

      const [status, message, base64] = await getFileToBase64({
        prefix: ['uploads', 'user', 'avatar'],
        name: path.basename(file.filename, path.extname(file.filename)),
      });

      await this.userService.updateAvatar(user.id, file.filename);

      return response(res, status, message, {
        path: path.normalize(file.path.replace('public', '')),
        base64: base64,
      });
    } catch (e) {
      console.error(e);
      return response(res, HttpStatus.INTERNAL_SERVER_ERROR, e, null);
    }
  }

  @Get('account/avatar')
  async getAvatar(@Res() res: Response, @Query() query: any) {
    try {
      const { userId, type } = query;
      const [status, error, user] = await this.userService.findOneById(userId);

      if (type && type.toLowerCase() === 'base64') {
        const [status, message, base64] = await getFileToBase64({
          prefix: ['uploads', 'user', 'avatar'],
          name: path.basename(user.avatar, path.extname(user.avatar)),
        });

        return response(res, status, message, base64);
      } else {
        const [status, message, file, contentType] = await getFile({
          prefix: ['uploads', 'user', 'avatar'],
          name: path.basename(user.avatar, path.extname(user.avatar)),
        });

        if (!file) {
          return response(res, status, message, file);
        }

        res.set({
          'Content-Type': contentType,
        });
        return file.pipe(res);
      }
    } catch (e) {
      console.error(e);

      return response(res, HttpStatus.INTERNAL_SERVER_ERROR, e, null);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('friend')
  async friend(@Res() res: Response, @User() user: Payload) {
    try {
      const [status, message, friends] = await this.userService.getFriends(
        user.id,
      );

      return response(res, status, message, friends);
    } catch (e) {
      console.error(e);
      return response(res, HttpStatus.INTERNAL_SERVER_ERROR, e, null);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('conversation')
  async conversations(@Res() res: Response, @User() user: Payload) {
    try {
      const [
        status,
        message,
        conversations,
      ] = await this.userService.getConversations(user.id);

      return response(res, status, message, conversations);
    } catch (e) {
      console.error(e);
      return response(res, HttpStatus.INTERNAL_SERVER_ERROR, e, null);
    }
  }

  @Get('search')
  async search(@Res() res: Response, @Query() searchUserDto: SearchUserDto) {
    try {
      const [status, message, results] = await this.userService.findByQuery(
        searchUserDto,
      );

      return response(res, status, message, results);
    } catch (e) {
      console.error(e);

      return response(res, HttpStatus.INTERNAL_SERVER_ERROR, e, null);
    }
  }

  @Get(':id')
  async userById(@Res() res: Response, @Param('id') id: string) {
    try {
      const [status, message, user] = await this.userService.findOneById(id);

      return response(res, status, message, user);
    } catch (e) {
      console.error(e);

      return response(res, HttpStatus.INTERNAL_SERVER_ERROR, e, null);
    }
  }
}
