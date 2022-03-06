import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from '../auth/auth.module';
import { Conversation } from '../conversation/entities/conversation.entity';
import { Friend } from '../friend/entities/friend.entity';
import { Post } from '../post/entities/post.entity';
import { User } from '../user/entities/user.entity';
import { UsersService } from '../user/user.service';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { Chat } from './entities/chat.entity';

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([Chat, User, Conversation, Friend, Post]),
  ],
  providers: [ChatGateway, ChatService, UsersService, Conversation],
})
export class ChatModule {}
