import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  HttpStatus,
  Res,
  HttpException,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { FriendService } from './friend.service';
import { CreateFriendDto } from './dto/create-friend.dto';
import { UpdateFriendDto } from './dto/update-friend.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { response } from 'src/utils/response';
import { User } from 'src/decorators/user.decorator';
import { Payload } from 'src/interfaces/payload.interface';
import { ApiTags } from '@nestjs/swagger';

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
      const [err, newFriend, message] = await this.friendService.create({
        user: user,
        ...createFriendDto,
      });

      return response(res, err, {
        message: message,
        data: newFriend,
      });
    } catch (e) {
      console.error(e);
      return response(res, HttpStatus.INTERNAL_SERVER_ERROR, {
        message: e,
        data: null,
      });
    }
  }

  @Get()
  findAll() {
    return this.friendService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.friendService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFriendDto: UpdateFriendDto) {
    return this.friendService.update(+id, updateFriendDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.friendService.remove(+id);
  }
}
