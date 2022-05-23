import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from '../user/entities/user.entity';
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

  async create(createPostDto: CreatePostDto) {
    try {
      const user = await this.userRespository.findOne(createPostDto.user.id);

      const newPost = await this.postRespository.save({
        ...createPostDto,
        user,
      });

      return newPost;
    } catch (error) {
      console.error(error);
      throw new Error(error);
    }
  }

  async findById(id: string) {
    try {
      const post = await this.postRespository
        .createQueryBuilder('post')
        .leftJoinAndSelect('post.like_by_users', 'postLikes')
        .where('post.id = :postId', { postId: id })
        .getOne();

      return post;
    } catch (error) {
      console.error(error);
      throw new Error(error);
    }
  }

  async isLikedById(id: string) {
    const post = await this.postRespository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.like_by_users', 'postLikes')
      .where('post.id = :postId', { postId: id })
      .getOne();

    const isLiked = await this.userRespository.findByIds(post.like_by_users);

    return isLiked;
  }

  async likePostById(id: string, userId: string) {
    try {
      const post = await this.postRespository
        .createQueryBuilder('post')
        .leftJoinAndSelect('post.like_by_users', 'postLikes')
        .where('post.id = :postId', { postId: id })
        .getOne();
      const user = await this.userRespository.findOne(userId);

      const likedPost = await this.postRespository.save({
        ...post,
        like_by_users: [...post.like_by_users, user],
      });

      return likedPost;
    } catch (error) {
      console.error(error);
      throw new Error(error);
    }
  }

  async remove(postId: string) {
    try {
      const deletedPost = await this.postRespository.delete({ id: postId });

      return deletedPost;
    } catch (error) {
      console.error(error);
      throw new Error(error);
    }
  }
}
