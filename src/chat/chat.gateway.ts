import { UseGuards } from '@nestjs/common';
import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

import { WsGuard } from '../auth/ws.guard';
import { Event } from '../decorators/event.decorator';
import { ChatService } from './chat.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { RemoveChatDto } from './dto/remove-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';

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
      const [status, message, chat] = await this.chatService.create(
        createChatDto,
      );
      return this.server.emit('createChat', { status, message, data: chat });
    } catch (error) {
      console.error(error);
      return this.server.emit('createChat', error);
    }
  }

  @UseGuards(WsGuard)
  @SubscribeMessage('removeChat')
  async remove(@MessageBody() removeChatDto: RemoveChatDto) {
    try {
      const [status, message, chat] = await this.chatService.remove(
        removeChatDto,
      );
      return this.server.emit('removeChat', { status, message, data: chat });
    } catch (error) {
      console.error(error);
      return this.server.emit('removeChat', error);
    }
  }
}
