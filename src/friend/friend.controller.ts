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
} from '@nestjs/common';
import { FriendService } from './friend.service';
import { CreateFriendDto } from './dto/create-friend.dto';
import { UpdateFriendDto } from './dto/update-friend.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RequestWithUser } from 'src/interfaces/request-with-user.interface';

@Controller('friend')
export class FriendController {
  constructor(private readonly friendService: FriendService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @Req() req: RequestWithUser,
    @Body() createFriendDto: CreateFriendDto,
  ) {
    return this.friendService.create({
      user: req.user,
      ...createFriendDto,
    });
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
