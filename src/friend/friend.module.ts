import { Module } from '@nestjs/common';
import { FriendService } from './friend.service';
import { FriendController } from './friend.controller';
import { Friend } from './entities/friend.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Friend]),
    TypeOrmModule.forFeature([User]),
  ],
  controllers: [FriendController],
  providers: [FriendService],
})
export class FriendModule {}
