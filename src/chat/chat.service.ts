import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Conversation } from '../conversation/entities/conversation.entity';
import { ResponseResult } from '../utils/response';
import { CreateChatDto } from './dto/create-chat.dto';
import { RemoveChatDto } from './dto/remove-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';
import { Chat } from './entities/chat.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Chat)
    private chatRepository: Repository<Chat>,
    @InjectRepository(Conversation)
    private conversationRepository: Repository<Conversation>,
  ) {}

  async create(createChatDto: CreateChatDto): Promise<ResponseResult> {
    const conversation = await this.conversationRepository.findOne(
      createChatDto.conversation.id,
    );

    await this.conversationRepository.update(conversation.id, {
      updated_at: new Date(),
      lastMessage: createChatDto.message,
    });

    return [
      HttpStatus.OK,
      'Successfully Send message!',
      await this.chatRepository.save({
        conversation: conversation,
        ...createChatDto,
      }),
    ];
  }

  findAll() {
    return `This action returns all chat`;
  }

  findOne(id: number) {
    return `This action returns a #${id} chat`;
  }

  update(id: number, updateChatDto: UpdateChatDto) {
    return `This action updates a #${id} chat`;
  }

  async remove(removeChatDto: RemoveChatDto): Promise<ResponseResult> {
    const deleteChat = await this.chatRepository.delete({
      id: removeChatDto.chat.id,
      user: removeChatDto.user,
    });

    return [HttpStatus.OK, 'Successfully Send message!', deleteChat];
  }
}
