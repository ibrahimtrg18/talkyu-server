import { User } from '../../user/entities/user.entity';
import { Chat } from '../entities/chat.entity';

export class RemoveChatDto {
  chat: Chat;
  user: User;
}
