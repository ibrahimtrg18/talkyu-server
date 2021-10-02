import { ConversationType } from '../interfaces/ConversationType';
import {
  ArrayMinSize,
  IsArray,
  IsDefined,
  IsEnum,
  IsNotEmpty,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class UserDto {
  @IsDefined()
  @IsNotEmpty()
  @IsUUID()
  id: string;
}

export class CreateConversationDto {
  @IsDefined()
  @IsNotEmpty()
  @IsEnum(ConversationType)
  type: ConversationType;

  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  @Type(() => UserDto)
  users: UserDto[];
}
