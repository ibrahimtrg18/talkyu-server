import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm/repository/Repository';

import { User } from '../user/entities/user.entity';
import { ResponseResult } from '../utils/response';
import { CreateConversationDto } from './dto/create-conversation.dto';
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
    try {
      let isUsersHaveNotFound = false;
      const users = await Promise.all(
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
            users: users,
          }),
        ];
      }
    } catch (error) {
      console.error(error);
      throw new Error(error);
    }
  }

  async findById(id: string): Promise<ResponseResult> {
    try {
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
    } catch (error) {
      console.error(error);
      throw new Error(error);
    }
  }

  async getChatsById(id: string): Promise<ResponseResult> {
    try {
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
    } catch (error) {
      console.error(error);
      throw new Error(error);
    }
  }
}
