import { WebSocketGateway } from '@nestjs/websockets';

import { ConversationService } from './conversation.service';

@WebSocketGateway()
export class ConversationGateway {
  constructor(private readonly conversationService: ConversationService) {}
}
