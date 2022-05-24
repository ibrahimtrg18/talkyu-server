import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Comment } from '../comment/entities/comment.entity';
import { User } from '../user/entities/user.entity';
import { Post } from './entities/post.entity';
import { PostController } from './post.controller';
import { PostService } from './post.service';

@Module({
  imports: [TypeOrmModule.forFeature([Post, User, Comment])],
  controllers: [PostController],
  providers: [PostService],
})
export class PostModule {}
