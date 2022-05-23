import { HttpStatus, UseGuards } from '@nestjs/common';
import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

import { WsGuard } from '../auth/ws.guard';
import { Event } from '../decorators/event.decorator';
import { response } from '../utils/response';
import { ChatService } from './chat.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { RemoveChatDto } from './dto/remove-chat.dto';

@WebSocketGateway()
export class ChatGateway {
  constructor(private readonly chatService: ChatService) {}

  @WebSocketServer()
  server: Server;

  @UseGuards(WsGuard)
  @SubscribeMessage('createChat')
  @Event('createChat')
  async create(@MessageBody() createChatDto: CreateChatDto) {
    try {
      const chat = await this.chatService.create(createChatDto);

      if (!chat) {
        return this.server.emit(
          'createChat',
          response(null, HttpStatus.BAD_REQUEST, 'Failed: send message!', chat),
        );
      }

      return this.server.emit(
        'createChat',
        response(null, HttpStatus.OK, 'Successfully: send message!', chat),
      );
    } catch (error) {
      console.error(error);
      return this.server.emit(
        'createChat',
        response(null, HttpStatus.INTERNAL_SERVER_ERROR, error, null),
      );
    }
  }

  @UseGuards(WsGuard)
  @SubscribeMessage('removeChat')
  async remove(@MessageBody() removeChatDto: RemoveChatDto) {
    try {
      const chat = await this.chatService.remove(removeChatDto);

      if (!chat.affected) {
        return this.server.emit(
          'createChat',
          response(
            null,
            HttpStatus.BAD_REQUEST,
            'Failed: remove message!',
            chat,
          ),
        );
      }

      return this.server.emit(
        'removeChat',
        response(null, HttpStatus.OK, 'Successfully: remove message', chat),
      );
    } catch (error) {
      console.error(error);
      return this.server.emit(
        'removeChat',
        response(null, HttpStatus.INTERNAL_SERVER_ERROR, error, null),
      );
    }
  }
}
