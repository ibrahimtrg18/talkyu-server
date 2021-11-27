import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Res,
  HttpStatus,
  UseGuards,
  Req,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { UsersService } from './user.service';
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
import { ApiTags } from '@nestjs/swagger';
import { UpdateUserAvatarDto } from './dto/update-user-avatar.dto';
import { createFile, getFileToBase64, getFile } from '../utils/file';
import { TokenUserDto } from './dto/token-user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';

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
  async loginGoogle(@Req() req: Request, @Res() res: Response) {
    try {
      const client = new OAuth2Client({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
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

      if (status === HttpStatus.CONFLICT) {
        const [status, message, token] = await this.authService.login({
          email: payload.email,
        });

        return response(res, status, message, token);
      } else {
        const [status, message, token] = await this.authService.login({
          email: newUser.email,
        });

        return response(res, status, message, token);
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
      response(res, HttpStatus.OK, 'Successfully data account!', user);
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

      createFile(file, { prefix: ['user', 'avatar'], name: user.id });

      response(res, HttpStatus.OK, 'Successfully update avatar!', null);
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
          cb(null, `${id}${path.extname(file.originalname)}`);
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
  ) {
    try {
      if (!file) {
        response(
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
      if (type && type.toLowerCase() === 'base64') {
        const [status, message, base64] = await getFileToBase64({
          prefix: ['uploads', 'user', 'avatar'],
          name: userId,
        });

        return response(res, status, message, base64);
      } else {
        const [status, message, file, contentType] = await getFile({
          prefix: ['uploads', 'user', 'avatar'],
          name: userId,
        });

        if (!file) {
          return response(res, status, message, file);
        }

        res.set({
          'Content-Type': contentType,
          'Content-Disposition': 'attachment; filename="package.json"',
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
  findOneById(@Res() res: Response, @Param('id') id: string) {
    try {
      return this.userService.findOneById(id);
    } catch (e) {
      console.error(e);

      return response(res, HttpStatus.INTERNAL_SERVER_ERROR, e, null);
    }
  }
}
