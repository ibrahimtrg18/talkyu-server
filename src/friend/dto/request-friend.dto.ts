import { IsDefined, IsNotEmpty } from 'class-validator';
import { User } from 'src/user/entities/user.entity';

export class RequestFriendDto {
  user: User;

  @IsDefined()
  @IsNotEmpty()
  friend: User;
}
