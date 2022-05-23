import {
  Body,
  Controller,
  Get,
  HttpStatus,
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
    const conversation = await this.conversationService.create({
      ...createConversationDto,
      users: [...createConversationDto.users, user],
    });

    if (!conversation) {
      return response(
        res,
        HttpStatus.UNPROCESSABLE_ENTITY,
        'Failed: Check user ids Invalid!',
        conversation,
      );
    }

    return response(
      res,
      HttpStatus.CREATED,
      'Successfully: Create conversation!',
      conversation,
    );
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async findById(@Res() res: Response, @Param('id') id: string) {
    const isExist = await this.conversationService.findById(id);

    if (!isExist) {
      return response(
        res,
        HttpStatus.NOT_FOUND,
        'Failed: Conversation not found!',
        isExist,
      );
    }

    const conversation = await this.conversationService.findConversationUserById(
      id,
    );

    if (!conversation) {
      return response(
        res,
        HttpStatus.NOT_FOUND,
        'Failed: Conversation not found!',
        conversation,
      );
    }

    return response(
      res,
      HttpStatus.OK,
      'Successfully: Get conversation!',
      conversation,
    );
  }

  @Get(':id/chat')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getChatsByConversationId(
    @Res() res: Response,
    @Param('id') id: string,
  ) {
    const isExist = await this.conversationService.findById(id);

    if (!isExist) {
      return response(
        res,
        HttpStatus.NOT_FOUND,
        'Failed: Conversation not found!',
        isExist,
      );
    }

    const chats = await this.conversationService.getChatsById(id);

    return response(
      res,
      HttpStatus.OK,
      'Successfully: Get chat conversation',
      chats,
    );
  }
}
