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
import { Response } from 'passport-strategy/node_modules/@types/express';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { response } from 'src/utils/response';
import { ConversationService } from './conversation.service';
import { CreateConversationDto } from './dto/create-conversation.dto';

@Controller('conversation')
export class ConversationController {
  constructor(private readonly conversationService: ConversationService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async createConversation(
    @Res() res: Response,
    @Body() createConversationDto: CreateConversationDto,
  ) {
    const [error, conversation] = await this.conversationService.create(
      createConversationDto,
    );

    if (error) {
      return response(res, error, {
        message: 'Please, check user again!',
        data: conversation,
      });
    } else {
      return response(res, HttpStatus.CREATED, {
        message: 'Successfully create conversation!',
        data: conversation,
      });
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findById(@Param('id') id: string) {
    return this.conversationService.findById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/chats')
  getChatsByConversationId(@Param('id') id: string) {
    return this.conversationService.getChatsById(id);
  }
}
