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
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'passport-strategy/node_modules/@types/express';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { User } from 'src/decorators/user.decorator';
import { response } from 'src/utils/response';
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
    const [error, conversation] = await this.conversationService.create({
      ...createConversationDto,
      users: [...createConversationDto.users, user],
    });

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
  async findById(@Res() res: Response, @Param('id') id: string) {
    const [error, conversation] = await this.conversationService.findById(id);

    if (error) {
      return response(res, error, {
        message: 'Please, check user again!',
        data: conversation,
      });
    }

    return response(res, HttpStatus.OK, {
      message: 'Successfully create conversation!',
      data: conversation,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/chat')
  async getChatsByConversationId(
    @Res() res: Response,
    @Param('id') id: string,
  ) {
    const [
      error,
      conversationChat,
    ] = await this.conversationService.getChatsById(id);

    if (error) {
      return response(res, error, {
        message: 'Please, check user again!',
        data: conversationChat,
      });
    } else {
      return response(res, HttpStatus.CREATED, {
        message: 'Successfully create conversation!',
        data: conversationChat,
      });
    }
  }
}
