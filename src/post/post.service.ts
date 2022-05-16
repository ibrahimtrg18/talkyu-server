import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from '../user/entities/user.entity';
import { ResponseResult } from '../utils/response';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
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
    } catch (e) {
      console.error(e);
      throw new Error(e);
    }
  }

  findAll() {
    return `This action returns all post`;
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
    } catch (e) {
      console.error(e);
      throw new Error(e);
    }
  }

  update(id: number, updatePostDto: UpdatePostDto) {
    return `This action updates a #${id} post`;
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
    } catch (e) {
      console.error(e);
      throw new Error(e);
    }
  }

  remove(id: number) {
    return `This action removes a #${id} post`;
  }
}
