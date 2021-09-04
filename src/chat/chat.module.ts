import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { AuthModule } from 'src/auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Chat } from './entities/chat.entity';
import { UsersService } from 'src/users/users.service';
import { User } from 'src/users/entities/user.entity';
import { Conversation } from 'src/conversation/entities/conversation.entity';

@Module({
  imports: [AuthModule, TypeOrmModule.forFeature([Chat, User, Conversation])],
  providers: [ChatGateway, ChatService, UsersService, Conversation],
})
export class ChatModule {}
