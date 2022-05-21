import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from '../user/entities/user.entity';
import { ResponseResult } from '../utils/response';
import { CreatePostDto } from './dto/create-post.dto';
import { Post } from './entities/post.entity';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post)
    private readonly postRespository: Repository<Post>,
    @InjectRepository(User)
    private readonly userRespository: Repository<User>,
  ) {}

  async create(createPostDto: CreatePostDto): Promise<ResponseResult> {
    try {
      const user = await this.userRespository.findOne(createPostDto.user.id);

      return [
        HttpStatus.CREATED,
        'Successfully added a new post',
        await this.postRespository.save({ ...createPostDto, user }),
      ];
    } catch (error) {
      console.error(error);
      throw new Error(error);
    }
  }

  async findPostById(id: string): Promise<ResponseResult> {
    try {
      const post = await this.postRespository
        .createQueryBuilder('post')
        .leftJoinAndSelect('post.like_by_users', 'postLikes')
        .where('post.id = :postId', { postId: id })
        .getOne();

      if (!post) {
        return [HttpStatus.NOT_FOUND, 'Not found post!', null];
      }

      return [HttpStatus.OK, 'Found post!', post];
    } catch (error) {
      console.error(error);
      throw new Error(error);
    }
  }

  async likePostById(id: string, userId: string): Promise<ResponseResult> {
    try {
      const post = await this.postRespository
        .createQueryBuilder('post')
        .leftJoinAndSelect('post.like_by_users', 'postLikes')
        .where('post.id = :postId', { postId: id })
        .getOne();
      const user = await this.userRespository.findOne(userId);

      const isLiked = await this.userRespository.findByIds(post.like_by_users);

      if (isLiked.length) {
        return [HttpStatus.CONFLICT, 'Post already liked!', null];
      }

      const likedPost = await this.postRespository.save({
        ...post,
        like_by_users: [...post.like_by_users, user],
      });

      return [HttpStatus.ACCEPTED, 'Post liked!', likedPost];
    } catch (error) {
      console.error(error);
      throw new Error(error);
    }
  }

  async removePostById(
    postId: string,
    userId: string,
  ): Promise<ResponseResult> {
    try {
      const user = await this.userRespository.findOne(userId);

      const post = await this.postRespository
        .createQueryBuilder('post')
        .leftJoinAndSelect('post.user', 'user')
        .where('post.id = :postId', { postId })
        .getOne();

      if (!post) {
        return [HttpStatus.NOT_FOUND, 'Post not found!', null];
      }

      if (post.user.id !== user.id) {
        return [
          HttpStatus.FORBIDDEN,
          'Dont have permission for deleting this post!',
          null,
        ];
      } else {
        const deletedPost = await this.postRespository.delete({ id: postId });

        return [HttpStatus.ACCEPTED, 'Post is deleted!', deletedPost];
      }
    } catch (error) {
      console.error(error);
      throw new Error(error);
    }
  }
}
