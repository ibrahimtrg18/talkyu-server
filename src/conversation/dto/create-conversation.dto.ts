import { ConversationType } from '../interfaces/ConversationType';
import { IsArray, IsDefined, IsEnum, IsNotEmpty } from 'class-validator';
import { User } from 'src/users/entities/user.entity';

export class CreateConversationDto {
  @IsDefined()
  @IsNotEmpty()
  @IsEnum(ConversationType)
  type: ConversationType;

  @IsDefined()
  @IsNotEmpty()
  @IsArray()
  users: Array<User>;
}
