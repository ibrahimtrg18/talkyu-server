import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateCommentDto } from '../comment/dto/create-comment.dto';
import { Comment } from '../comment/entities/comment.entity';
import { User } from '../user/entities/user.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { Post } from './entities/post.entity';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
  ) {}

  async create(createPostDto: CreatePostDto) {
    try {
      const user = await this.userRepository.findOne(createPostDto.user.id);

      const newPost = await this.postRepository.save({
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
      const post = await this.postRepository
        .createQueryBuilder('post')
        .leftJoinAndSelect('post.like_by_users', 'postLikes')
        .leftJoinAndSelect('post.comments', 'postComments')
        .leftJoinAndSelect('post.user', 'postUser')
        .leftJoinAndSelect('postComments.user', 'commentUser')
        .where('post.id = :postId', { postId: id })
        .getOne();

      return post;
    } catch (error) {
      console.error(error);
      throw new Error(error);
    }
  }

  async isLikedById(id: string) {
    const post = await this.findById(id);

    const isLiked = await this.userRepository.findByIds(post.like_by_users);

    return isLiked;
  }

  async likePostById(id: string, userId: string) {
    try {
      const post = await this.findById(id);

      const user = await this.userRepository.findOne(userId);

      const likedPost = await this.postRepository.save({
        ...post,
        like_by_users: [...post.like_by_users, user],
      });

      return likedPost;
    } catch (error) {
      console.error(error);
      throw new Error(error);
    }
  }

  async commentByPostId(
    id: string,
    createCommentDto: CreateCommentDto,
    userId: string,
  ) {
    try {
      const user = await this.userRepository.findOne(userId);

      const post = await this.postRepository.findOne(id);

      const comment = await this.commentRepository.save({
        ...createCommentDto,
        user,
        post,
      });

      return comment;
    } catch (error) {
      console.error(error);
      throw new Error(error);
    }
  }

  async remove(postId: string) {
    try {
      const deletedPost = await this.postRepository.delete({ id: postId });

      return deletedPost;
    } catch (error) {
      console.error(error);
      throw new Error(error);
    }
  }
}
