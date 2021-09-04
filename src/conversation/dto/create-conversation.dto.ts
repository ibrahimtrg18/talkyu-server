import { ConversationType } from '../interfaces/ConversationType';
import { IsDefined, IsNotEmpty } from 'class-validator';

export class CreateConversationDto {
  @IsDefined()
  @IsNotEmpty()
  type: ConversationType;
}
