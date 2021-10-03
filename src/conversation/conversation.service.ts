import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm/repository/Repository';
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
  ): Promise<[HttpStatus, CreateConversationDto & Conversation]> {
    let isUsersHaveNotFound = false;
    const users = await Promise.all(
      createConversationDto.users.map(async (user) => {
        const isExist = await this.userRepository.findOne(user.id);

        if (isExist) {
          return user;
        } else {
          isUsersHaveNotFound = true;
        }
      }),
    );

    if (isUsersHaveNotFound) {
      return [HttpStatus.UNPROCESSABLE_ENTITY, null];
    } else {
      return [
        null,
        await this.conversationRepository.save({
          ...createConversationDto,
          users: users,
        }),
      ];
    }
  }

  async findById(id: string): Promise<[HttpStatus, Conversation]> {
    const isExist = await this.conversationRepository.findOne(id);

    if (!isExist) {
      return [HttpStatus.NOT_FOUND, null];
    }

    return [
      null,
      await this.conversationRepository.findOne({
        relations: ['users'],
        where: { id },
      }),
    ];
  }

  async getChatsById(id: string) {
    const chats = await this.conversationRepository
      .createQueryBuilder('conversation')
      .leftJoinAndSelect('conversation.chats', 'chat')
      .where('conversation.id = :id', { id })
      .orderBy('chat.created_at', 'ASC')
      .getMany();

    return chats;
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
