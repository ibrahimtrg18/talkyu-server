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
  HttpException,
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
import { RequestWithUser } from 'src/interfaces/request-with-user.interface';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {}

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto, @Res() res: Response) {
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
  }

  @Post('login')
  async login(@Body() loginUserDto: LoginUserDto, @Res() res: Response) {
    const token = await this.authService.login(loginUserDto);

    return response(res, HttpStatus.OK, {
      message: 'Successfully Login',
      data: token,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get('account')
  async account(@Req() req: Request, @Res() res: Response) {
    return response(res, HttpStatus.OK, {
      message: 'Successfully data account',
      data: req.user,
    });
  }

  @Get()
  search(@Query('name') name: string) {
    return this.usersService.findByName(name);
  }

  @Get(':id')
  findOneById(@Param('id') id: string) {
    return this.usersService.findOneById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch()
  async update(
    @Req() req: RequestWithUser,
    @Res() res: Response,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    if (!updateUserDto.password) {
      return response(res, HttpStatus.BAD_REQUEST, {
        message: 'Password is required!',
      });
    }

    const [error, newUser] = await this.usersService.updateAccount(
      req.user.id,
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
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
