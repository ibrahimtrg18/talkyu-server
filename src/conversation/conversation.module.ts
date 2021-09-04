import { Module } from '@nestjs/common';
import { ConversationService } from './conversation.service';
import { ConversationGateway } from './conversation.gateway';
import { ConversationController } from './conversation.controller';

@Module({
  providers: [ConversationGateway, ConversationService],
  controllers: [ConversationController]
})
export class ConversationModule {}
