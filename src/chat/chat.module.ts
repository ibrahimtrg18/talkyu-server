import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { AuthModule } from 'src/auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Chat } from './entities/chat.entity';
import { UsersService } from 'src/user/user.service';
import { User } from 'src/user/entities/user.entity';
import { Conversation } from 'src/conversation/entities/conversation.entity';
import { Friend } from 'src/friend/entities/friend.entity';

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([Chat, User, Conversation, Friend]),
  ],
  providers: [ChatGateway, ChatService, UsersService, Conversation],
})
export class ChatModule {}
