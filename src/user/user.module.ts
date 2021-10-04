import { forwardRef, Module } from '@nestjs/common';
import { UsersService } from './user.service';
import { UsersController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { AuthModule } from 'src/auth/auth.module';
import { Friend } from 'src/friend/entities/friend.entity';
import { Conversation } from 'src/conversation/entities/conversation.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Friend, Conversation]),
    forwardRef(() => AuthModule),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
