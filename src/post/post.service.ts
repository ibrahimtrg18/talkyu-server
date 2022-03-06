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

  findOne(id: number) {
    return `This action returns a #${id} post`;
  }

  update(id: number, updatePostDto: UpdatePostDto) {
    return `This action updates a #${id} post`;
  }

  remove(id: number) {
    return `This action removes a #${id} post`;
  }
}
