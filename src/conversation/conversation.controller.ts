import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { User } from '../decorators/user.decorator';
import { response } from '../utils/response';
import { ConversationService } from './conversation.service';
import { CreateConversationDto } from './dto/create-conversation.dto';

@ApiTags('Conversation')
@Controller('conversation')
export class ConversationController {
  constructor(private readonly conversationService: ConversationService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
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

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async findById(@Res() res: Response, @Param('id') id: string) {
    const [
      status,
      message,
      conversation,
    ] = await this.conversationService.findById(id);

    return response(res, status, message, conversation);
  }

  @Get(':id/chat')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
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
