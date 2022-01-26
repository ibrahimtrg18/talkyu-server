import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm/repository/Repository';

import { User } from '../user/entities/user.entity';
import { ResponseResult } from '../utils/response';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { UpdateConversationDto } from './dto/update-conversation.dto';
import { Conversation } from './entities/conversation.entity';

@Injectable()
export class ConversationService {
  constructor(
    @InjectRepository(Conversation)
    private conversationRepository: Repository<Conversation>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(
    createConversationDto: CreateConversationDto,
  ): Promise<ResponseResult> {
    let isUsersHaveNotFound = false;
    const user = await Promise.all(
      createConversationDto.users.map(async (user) => {
        const isExist = await this.userRepository.findOne(user.id);

        if (isExist) {
          return isExist;
        } else {
          isUsersHaveNotFound = true;
        }
      }),
    );

    if (isUsersHaveNotFound) {
      return [
        HttpStatus.UNPROCESSABLE_ENTITY,
        'Please, check user again!',
        null,
      ];
    } else {
      return [
        HttpStatus.CREATED,
        'Successfully create conversation!',
        await this.conversationRepository.save({
          ...createConversationDto,
          users: user,
        }),
      ];
    }
  }

  async findById(id: string): Promise<ResponseResult> {
    const isExist = await this.conversationRepository.findOne(id);

    if (!isExist) {
      return [
        HttpStatus.NOT_FOUND,
        `Please, couldn't find conversation!`,
        null,
      ];
    }

    return [
      HttpStatus.OK,
      'Successfully get conversation!',
      await this.conversationRepository.findOne({
        relations: ['users'],
        where: { id },
      }),
    ];
  }

  async getChatsById(id: string): Promise<ResponseResult> {
    const isExist = await this.conversationRepository.findOne(id);

    if (!isExist) {
      return [
        HttpStatus.NOT_FOUND,
        `Please, couldn't find chat of conversation!`,
        null,
      ];
    }

    const chats = await this.conversationRepository
      .createQueryBuilder('conversation')
      .leftJoinAndSelect('conversation.chats', 'chat')
      .leftJoinAndSelect('chat.user', 'user')
      .where('conversation.id = :id', { id })
      .orderBy('chat.created_at', 'DESC')
      .getOne();

    return [HttpStatus.OK, 'Successfully get chat of conversation!', chats];
  }

  findAll() {
    return `This action returns all conversation`;
  }

  findOne(id: number) {
    return `This action returns a #${id} conversation`;
  }

  update(id: number, updateConversationDto: UpdateConversationDto) {
    return `This action updates a #${id} conversation`;
  }

  remove(id: number) {
    return `This action removes a #${id} conversation`;
  }
}
