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
import { UserService } from '../user/user.service';
import { response } from '../utils/response';
import { AcceptFriendDto } from './dto/accept-friend.dto';
import { RequestFriendDto } from './dto/request-friend.dto';
import { FriendStatus } from './entities/friend.entity';
import { FriendService } from './friend.service';

@ApiTags('Friend')
@Controller('friend')
export class FriendController {
  constructor(
    private readonly friendService: FriendService,
    private readonly userService: UserService,
  ) {}

  @Post('request')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async requestFriend(
    @Res() res: Response,
    @Body() requestFriendDto: RequestFriendDto,
    @User() user: Payload,
  ) {
    try {
      const friend = await this.userService.findOneById(
        requestFriendDto.friend.id,
      );

      if (!friend) {
        return response(
          res,
          HttpStatus.NOT_FOUND,
          'Failed: User not found!',
          null,
        );
      }

      const isExist = await this.friendService.findByUserIdAndFriendId(
        user.id,
        friend.id,
      );

      if (isExist) {
        return response(
          res,
          HttpStatus.CONFLICT,
          'Failed: Already sent a request friend!',
          null,
        );
      }

      const newFriend = await this.friendService.requestFriend({
        user,
        ...requestFriendDto,
      });

      return response(
        res,
        HttpStatus.OK,
        'Successfully: Sent request friend!',
        newFriend,
      );
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
    @User() currentUser: Payload,
  ) {
    try {
      const user = await this.userService.findOneById(currentUser.id);
      const friend = await this.userService.findOneById(
        acceptFriendDto.friend.id,
      );

      if (!friend) {
        return response(
          res,
          HttpStatus.NOT_FOUND,
          'Failed: User not found!',
          null,
        );
      }

      const isAlreadyAcceptFriend = await this.friendService.findFriendUserByStatus(
        {
          user,
          friend,
          status: FriendStatus.ACCEPT,
        },
      );

      if (isAlreadyAcceptFriend) {
        return response(
          res,
          HttpStatus.CONFLICT,
          'Failed: Already added to friend!',
          null,
        );
      }

      const acceptedFriend = await this.friendService.acceptFriend({
        user: user,
        ...acceptFriendDto,
      });

      if (!acceptedFriend.affected) {
        return response(
          res,
          HttpStatus.BAD_REQUEST,
          'Failed: Something wrong!',
          null,
        );
      }

      return response(
        res,
        HttpStatus.NO_CONTENT,
        'Successfully: Accept request to friend!',
        acceptedFriend,
      );
    } catch (error) {
      console.error(error);
      return response(res, HttpStatus.INTERNAL_SERVER_ERROR, error, null);
    }
  }
}
