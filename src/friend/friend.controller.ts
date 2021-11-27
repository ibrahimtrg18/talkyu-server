import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpStatus,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
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
