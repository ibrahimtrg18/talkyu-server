import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from '../user/entities/user.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { Comment } from './entities/comment.entity';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  create(createCommentDto: CreateCommentDto) {
    return 'This action adds a new comment';
  }

  findAll() {
    return `This action returns all comment`;
  }

  findOne(id: number) {
    return `This action returns a #${id} comment`;
  }

  update(id: number, updateCommentDto: UpdateCommentDto) {
    return `This action updates a #${id} comment`;
  }

  remove(id: string) {
    try {
      const deletedComment = this.commentRepository.delete(id);

      return deletedComment;
    } catch (error) {
      console.error(error);
      throw new Error(error);
    }
  }

  findById(id: string) {
    try {
      const comment = this.commentRepository.findOne(id);

      return comment;
    } catch (error) {
      console.error(error);
      throw new Error(error);
    }
  }

  findByIdAndUserId(id: string, userId: string) {
    try {
      const user = this.userRepository.findOne(userId);

      const comment = this.commentRepository
        .createQueryBuilder('comment')
        .leftJoinAndSelect('comment.user', 'user')
        .where('comment.id = :commentId', { commentId: id })
        .getOne();

      return comment;
    } catch (error) {
      console.error(error);
      throw new Error(error);
    }
  }
}
