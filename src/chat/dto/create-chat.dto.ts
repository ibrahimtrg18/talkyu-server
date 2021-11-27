import { Conversation } from '../../conversation/entities/conversation.entity';
import { User } from '../../user/entities/user.entity';

export class CreateChatDto {
  message: string;
  conversation: Conversation;
  user: User;
}
