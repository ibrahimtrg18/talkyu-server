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
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { OAuth2Client } from 'google-auth-library';
import { diskStorage } from 'multer';
import * as path from 'path';

import { AuthService } from '../auth/auth.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { User } from '../decorators/user.decorator';
import { Payload } from '../interfaces/payload.interface';
import { createFile, getFile, getFileToBase64 } from '../utils/file';
import { comparePassword } from '../utils/password';
import { response } from '../utils/response';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginGoogleUserDto, LoginUserDto } from './dto/login-user.dto';
import { SearchUserDto } from './dto/search-user.dto';
import { TokenUserDto } from './dto/token-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateUserAvatarDto } from './dto/update-user-avatar.dto';
import { UserService } from './user.service';

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto, @Res() res: Response) {
    try {
      const isEmailExist = await this.userService.findOneByEmail(
        createUserDto.email,
      );

      if (isEmailExist) {
        return response(
          res,
          HttpStatus.CONFLICT,
          'Failed: Email is already register!',
          null,
        );
      }

      const newUser = await this.userService.register(createUserDto);

      return response(
        res,
        HttpStatus.CREATED,
        'Successfully: Create a new account!',
        newUser,
      );
    } catch (error) {
      console.error(error);
      return response(res, HttpStatus.INTERNAL_SERVER_ERROR, error, null);
    }
  }

  @Post('login')
  async login(@Body() loginUserDto: LoginUserDto, @Res() res: Response) {
    try {
      const authentication = await this.authService.login(loginUserDto);

      if (!authentication) {
        return response(
          res,
          HttpStatus.UNAUTHORIZED,
          'Failed: Email and Password incorrect!',
          authentication,
        );
      }

      return response(
        res,
        HttpStatus.OK,
        'Successfully: Login!',
        authentication,
      );
    } catch (error) {
      console.error(error);
      return response(res, HttpStatus.INTERNAL_SERVER_ERROR, error, null);
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

      const isEmailExist = await this.userService.findOneByEmail(payload.email);

      if (isEmailExist) {
        return response(
          res,
          HttpStatus.CONFLICT,
          'Failed: Email is already register!',
          null,
        );
      }

      const newUser = await this.userService.registerWithGoogle({
        email: payload.email,
        name: payload.name,
        google_open_id: payload.sub,
      });

      return response(
        res,
        HttpStatus.CREATED,
        'Successfully: Create a new account!',
        newUser,
      );
    } catch (error) {
      console.error(error);
      return response(res, HttpStatus.INTERNAL_SERVER_ERROR, error, null);
    }
  }

  @Post('google/login')
  async loginGoogle(
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
        return response(res, r.res.status, r.res.statusText, null);
      }

      const ticket = await client.verifyIdToken({
        idToken: r.tokens.id_token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();

      const isEmailExist = await this.userService.findOneByEmail(payload.email);

      if (!isEmailExist) {
        await this.userService.registerWithGoogle({
          email: payload.email,
          name: payload.name,
          google_open_id: payload.sub,
        });

        const authorization = await this.authService.loginGoogle({
          email: payload.email,
          google_open_id: payload.sub,
        });

        if (!authorization) {
          return response(
            res,
            HttpStatus.UNAUTHORIZED,
            'Failed: Email and password incorrect!',
            authorization,
          );
        }

        return response(
          res,
          HttpStatus.OK,
          'Successfully: Login!',
          authorization,
        );
      } else {
        const authorization = await this.authService.loginGoogle({
          email: payload.email,
          google_open_id: payload.sub,
        });

        return response(
          res,
          HttpStatus.OK,
          'Successfully: Login!',
          authorization,
        );
      }
    } catch (error) {
      console.error(error);
      return response(res, HttpStatus.INTERNAL_SERVER_ERROR, error, null);
    }
  }

  @Post('token')
  async token(@Res() res: Response, @Body() tokenUserDto: TokenUserDto) {
    try {
      const authorization = await this.authService.token({
        token: tokenUserDto.token,
      });

      if (!authorization) {
        return response(
          res,
          HttpStatus.UNAUTHORIZED,
          'Failed: Email and password incorrect!',
          authorization,
        );
      }

      return response(
        res,
        HttpStatus.OK,
        'Successfully: Create new token!',
        authorization,
      );
    } catch (error) {
      console.error(error);
      return response(res, HttpStatus.INTERNAL_SERVER_ERROR, error, null);
    }
  }

  @Patch('account')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async update(
    @Res() res: Response,
    @Body() updateUserDto: UpdateUserDto,
    @User() user: Payload,
  ) {
    try {
      const { confirmPassword, newPassword, ...rest } = updateUserDto;

      const isUserExist = await this.userService.findOneById(user.id);

      if (!isUserExist) {
        return response(
          res,
          HttpStatus.NOT_FOUND,
          'Failed: User not found!',
          isUserExist,
        );
      }

      const isPasswordMatch = await comparePassword(
        confirmPassword,
        isUserExist.password,
      );

      if (!isPasswordMatch) {
        return response(
          res,
          HttpStatus.FORBIDDEN,
          'Failed: Password is incorrect!',
          isPasswordMatch,
        );
      }

      const updatedUser = await this.userService.update({
        ...isUserExist,
        ...rest,
        password: newPassword,
      });

      return response(
        res,
        HttpStatus.OK,
        'Successfully: Update user account!',
        updatedUser,
      );
    } catch (error) {
      console.error(error);
      return response(res, HttpStatus.INTERNAL_SERVER_ERROR, error, null);
    }
  }

  @Get('account')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async account(@User() user: Payload, @Res() res: Response) {
    try {
      return response(
        res,
        HttpStatus.OK,
        'Successfully: Get user account!',
        user,
      );
    } catch (error) {
      console.error(error);
      return response(res, HttpStatus.INTERNAL_SERVER_ERROR, error, null);
    }
  }

  @Patch('account/avatar')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
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

      return response(res, HttpStatus.OK, 'Successfully: update avatar!', null);
    } catch (error) {
      console.error(error);
      return response(res, HttpStatus.INTERNAL_SERVER_ERROR, error, null);
    }
  }

  @Post('account/avatar')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
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
          "Failed: Field 'file' is required!",
          null,
        );
      }

      const base64 = await getFileToBase64({
        prefix: ['uploads', 'user', 'avatar'],
        name: path.basename(file.filename, path.extname(file.filename)),
      });

      await this.userService.updateAvatar(user.id, file.filename);

      return response(
        res,
        HttpStatus.ACCEPTED,
        'Successfully: update avatar!',
        {
          path: path.normalize(file.path.replace('public', '')),
          base64: base64,
        },
      );
    } catch (error) {
      console.error(error);
      return response(res, HttpStatus.INTERNAL_SERVER_ERROR, error, null);
    }
  }

  @Get('account/avatar')
  async getAvatar(@Res() res: Response, @Query() query: any) {
    try {
      const { userId, type } = query;
      const user = await this.userService.findOneById(userId);

      if (!user) {
        return response(
          res,
          HttpStatus.NOT_FOUND,
          'Failed: User not found!',
          user,
        );
      }

      if (type && type.toLowerCase() === 'base64') {
        const base64 = await getFileToBase64({
          prefix: ['uploads', 'user', 'avatar'],
          name: path.basename(user.avatar, path.extname(user.avatar)),
        });

        if (base64) {
          return response(
            res,
            HttpStatus.NOT_FOUND,
            'Failed: File not found!',
            null,
          );
        }

        return response(
          res,
          HttpStatus.OK,
          'Successfully: Get a file!',
          base64,
        );
      } else {
        const [file, contentType] = await getFile({
          prefix: ['uploads', 'user', 'avatar'],
          name: path.basename(user.avatar, path.extname(user.avatar)),
        });

        if (!file) {
          return response(
            res,
            HttpStatus.NOT_FOUND,
            'Failed: File not found!',
            null,
          );
        }

        res.set({
          'Content-Type': contentType,
        });
        return file.pipe(res);
      }
    } catch (error) {
      console.error(error);
      return response(res, HttpStatus.INTERNAL_SERVER_ERROR, error, null);
    }
  }

  @Get('friend')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async friend(@Res() res: Response, @User() user: Payload) {
    try {
      const friends = await this.userService.getFriends(user.id);

      return response(
        res,
        HttpStatus.OK,
        'Successfully: get friends!',
        friends,
      );
    } catch (error) {
      console.error(error);
      return response(res, HttpStatus.INTERNAL_SERVER_ERROR, error, null);
    }
  }

  @Get('conversation')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async conversations(@Res() res: Response, @User() user: Payload) {
    try {
      const conversations = await this.userService.getConversations(user.id);

      return response(
        res,
        HttpStatus.OK,
        'Successfully: Get conversations!',
        conversations,
      );
    } catch (error) {
      console.error(error);
      return response(res, HttpStatus.INTERNAL_SERVER_ERROR, error, null);
    }
  }

  @Get('search')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async search(
    @User() user: Payload,
    @Res() res: Response,
    @Query() searchUserDto: SearchUserDto,
  ) {
    try {
      const results = await this.userService.findByQuery({
        user,
        ...searchUserDto,
      });

      return response(res, HttpStatus.OK, 'Successfully: Get users!', results);
    } catch (error) {
      console.error(error);
      return response(res, HttpStatus.INTERNAL_SERVER_ERROR, error, null);
    }
  }

  @Get('post')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getPostByCurrentUser(@User() user: Payload, @Res() res: Response) {
    try {
      const posts = await this.userService.findPostsByUserId(user.id);

      return response(res, HttpStatus.OK, 'Successfully: Get posts', posts);
    } catch (error) {
      console.error(error);
      return response(res, HttpStatus.INTERNAL_SERVER_ERROR, error, null);
    }
  }

  @Get(':id')
  async userById(@Res() res: Response, @Param('id') id: string) {
    try {
      const user = await this.userService.findOneById(id);

      if (!user) {
        return response(
          res,
          HttpStatus.NOT_FOUND,
          'Failed: User not found!',
          user,
        );
      }

      return response(res, HttpStatus.OK, 'Successfully: Get user!', user);
    } catch (error) {
      console.error(error);
      return response(res, HttpStatus.INTERNAL_SERVER_ERROR, error, null);
    }
  }

  @Get(':id/post')
  async getPostsByUserId(@Res() res: Response, @Param('id') id: string) {
    try {
      const user = await this.userService.findOneById(id);

      if (!user) {
        return response(
          res,
          HttpStatus.NOT_FOUND,
          'Failed: User not found!',
          user,
        );
      }

      const posts = await this.userService.findPostsByUserId(id);

      return response(res, HttpStatus.OK, 'Successfully: Get posts', posts);
    } catch (error) {
      console.error(error);
      return response(res, HttpStatus.INTERNAL_SERVER_ERROR, error, null);
    }
  }
}
