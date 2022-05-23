import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as _ from 'lodash';
import { Repository } from 'typeorm/repository/Repository';

import { User } from '../user/entities/user.entity';
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

  async create(createConversationDto: CreateConversationDto) {
    try {
      const userIds = _.map(createConversationDto.users, 'id');
      const users = await this.userRepository.findByIds(userIds);

      if (userIds.length !== users.length) {
        return null;
      }

      const newConversation = await this.conversationRepository.save({
        ...createConversationDto,
        users: users,
      });

      return newConversation;
    } catch (error) {
      console.error(error);
      throw new Error(error);
    }
  }

  async findById(id: string) {
    try {
      const conversation = await this.conversationRepository.findOne(id);

      return conversation;
    } catch (error) {
      console.error(error);
      throw new Error(error);
    }
  }

  async findConversationUserById(id: string) {
    try {
      const conversation = await this.conversationRepository.findOne({
        relations: ['users'],
        where: { id },
      });

      return conversation;
    } catch (error) {
      console.error(error);
      throw new Error(error);
    }
  }

  async getChatsById(id: string) {
    try {
      const chats = await this.conversationRepository
        .createQueryBuilder('conversation')
        .leftJoinAndSelect('conversation.chats', 'chat')
        .leftJoinAndSelect('chat.user', 'user')
        .where('conversation.id = :id', { id })
        .orderBy('chat.created_at', 'DESC')
        .getOne();

      return chats;
    } catch (error) {
      console.error(error);
      throw new Error(error);
    }
  }
}
