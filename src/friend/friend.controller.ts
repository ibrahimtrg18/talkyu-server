import {
  Body,
  Controller,
  HttpStatus,
  Patch,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { User } from '../decorators/user.decorator';
import { Payload } from '../interfaces/payload.interface';
import { response } from '../utils/response';
import { AcceptFriendDto } from './dto/accept-friend.dto';
import { CreateFriendDto } from './dto/create-friend.dto';
import { RequestFriendDto } from './dto/request-friend.dto';
import { FriendService } from './friend.service';

@ApiTags('friend')
@Controller('friend')
export class FriendController {
  constructor(private readonly friendService: FriendService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
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
    } catch (e) {
      console.error(e);
      return response(res, HttpStatus.INTERNAL_SERVER_ERROR, e, null);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('request')
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
    } catch (e) {
      console.error(e);
      return response(res, HttpStatus.INTERNAL_SERVER_ERROR, e, null);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Patch('accept')
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
    } catch (e) {
      console.error(e);
      return response(res, HttpStatus.INTERNAL_SERVER_ERROR, e, null);
    }
  }
}
