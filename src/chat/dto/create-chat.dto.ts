import { Conversation } from 'src/conversation/entities/conversation.entity';
import { User } from 'src/user/entities/user.entity';

export class CreateChatDto {
  message: string;
  conversation: Conversation;
  user: User;
}
