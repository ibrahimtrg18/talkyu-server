import {
  Body,
  Controller,
  HttpStatus,
  Patch,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { User } from '../decorators/user.decorator';
import { Payload } from '../interfaces/payload.interface';
import { response } from '../utils/response';
import { AcceptFriendDto } from './dto/accept-friend.dto';
import { CreateFriendDto } from './dto/create-friend.dto';
import { RequestFriendDto } from './dto/request-friend.dto';
import { FriendService } from './friend.service';

@ApiTags('Friend')
@Controller('friend')
export class FriendController {
  constructor(private readonly friendService: FriendService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async create(
    @Res() res: Response,
    @Body() createFriendDto: CreateFriendDto,
    @User() user: Payload,
  ) {
    try {
      const [status, message, newFriend] = await this.friendService.create({
        user: user,
        ...createFriendDto,
      });

      return response(res, status, message, newFriend);
    } catch (error) {
      console.error(error);
      return response(res, HttpStatus.INTERNAL_SERVER_ERROR, error, null);
    }
  }

  @Post('request')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async requestFriend(
    @Res() res: Response,
    @Body() requestFriendDto: RequestFriendDto,
    @User() user: Payload,
  ) {
    try {
      const [
        status,
        message,
        newFriend,
      ] = await this.friendService.requestFriend({
        user: user,
        ...requestFriendDto,
      });

      return response(res, status, message, newFriend);
    } catch (error) {
      console.error(error);
      return response(res, HttpStatus.INTERNAL_SERVER_ERROR, error, null);
    }
  }

  @Patch('accept')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async acceptFriend(
    @Res() res: Response,
    @Body() acceptFriendDto: AcceptFriendDto,
    @User() user: Payload,
  ) {
    try {
      const [
        status,
        message,
        newFriend,
      ] = await this.friendService.acceptFriend({
        user: user,
        ...acceptFriendDto,
      });

      return response(res, status, message, newFriend);
    } catch (error) {
      console.error(error);
      return response(res, HttpStatus.INTERNAL_SERVER_ERROR, error, null);
    }
  }
}
