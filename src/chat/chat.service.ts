import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Conversation } from '../conversation/entities/conversation.entity';
import { CreateChatDto } from './dto/create-chat.dto';
import { RemoveChatDto } from './dto/remove-chat.dto';
import { Chat } from './entities/chat.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Chat)
    private chatRepository: Repository<Chat>,
    @InjectRepository(Conversation)
    private conversationRepository: Repository<Conversation>,
  ) {}

  async create(createChatDto: CreateChatDto) {
    try {
      const conversation = await this.conversationRepository.findOne(
        createChatDto.conversation.id,
      );

      await this.conversationRepository.update(conversation.id, {
        updated_at: new Date(),
        lastMessage: createChatDto.message,
      });

      const newChat = await this.chatRepository.save({
        conversation: conversation,
        ...createChatDto,
      });

      return newChat;
    } catch (error) {
      console.error(error);
      throw new Error(error);
    }
  }

  async remove(removeChatDto: RemoveChatDto) {
    try {
      const deletedChat = await this.chatRepository.delete({
        id: removeChatDto.chat.id,
        user: removeChatDto.user,
      });

      return deletedChat;
    } catch (error) {
      console.error(error);
      throw new Error(error);
    }
  }
}
