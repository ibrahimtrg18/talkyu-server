import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Conversation } from '../conversation/entities/conversation.entity';
import { Post } from '../post/entities/post.entity';
import { User } from '../user/entities/user.entity';
import { UserService } from '../user/user.service';
import { Friend } from './entities/friend.entity';
import { FriendController } from './friend.controller';
import { FriendService } from './friend.service';

@Module({
  imports: [TypeOrmModule.forFeature([Friend, User, Conversation, Post])],
  controllers: [FriendController],
  providers: [FriendService, UserService],
})
export class FriendModule {}
