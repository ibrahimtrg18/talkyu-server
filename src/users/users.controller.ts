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

    return response(res, HttpStatus.OK, {
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

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
