import { User } from 'src/users/entities/user.entity';

export class CreateChatDto {
  message: string;
  user: User;
}
