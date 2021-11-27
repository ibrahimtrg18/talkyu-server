import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { User } from '../decorators/user.decorator';
import { response } from '../utils/response';
import { ConversationService } from './conversation.service';
import { CreateConversationDto } from './dto/create-conversation.dto';

@ApiTags('conversation')
@Controller('conversation')
export class ConversationController {
  constructor(private readonly conversationService: ConversationService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async createConversation(
    @Res() res: Response,
    @Body() createConversationDto: CreateConversationDto,
    @User() user: any,
  ) {
    const [
      status,
      message,
      conversation,
    ] = await this.conversationService.create({
      ...createConversationDto,
      users: [...createConversationDto.users, user],
    });

    return response(res, status, message, conversation);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findById(@Res() res: Response, @Param('id') id: string) {
    const [
      status,
      message,
      conversation,
    ] = await this.conversationService.findById(id);

    return response(res, status, message, conversation);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/chat')
  async getChatsByConversationId(
    @Res() res: Response,
    @Param('id') id: string,
  ) {
    const [
      status,
      message,
      conversationChat,
    ] = await this.conversationService.getChatsById(id);

    return response(res, status, message, conversationChat);
  }
}
