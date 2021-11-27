import { IsDefined, IsNotEmpty } from 'class-validator';

import { User } from '../../user/entities/user.entity';

export class CreateFriendDto {
  user: User;

  @IsDefined()
  @IsNotEmpty()
  friend: User;
}
