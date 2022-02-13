import { Conversation } from '../../conversation/entities/conversation.entity';
import { User } from '../../user/entities/user.entity';
import { ChatType } from '../entities/chat.entity';

export class CreateChatDto {
  message: any;
  type: ChatType;
  conversation: Conversation;
  user: User;
}
