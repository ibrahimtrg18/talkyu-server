import { ConversationType } from '../interfaces/ConversationType';
import { IsDefined, IsEnum, IsNotEmpty } from 'class-validator';

export class CreateConversationDto {
  @IsDefined()
  @IsNotEmpty()
  @IsEnum(ConversationType)
  type: ConversationType;
}
