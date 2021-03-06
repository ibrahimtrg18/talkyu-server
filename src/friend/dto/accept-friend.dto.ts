import { IsDefined, IsNotEmpty } from 'class-validator';

import { User } from '../../user/entities/user.entity';

export class AcceptFriendDto {
  user: User;

  @IsDefined()
  @IsNotEmpty()
  friend: User;
}
