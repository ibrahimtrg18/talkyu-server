import { User } from '../entities/user.entity';

export class SearchUserDto {
  user: User;
  q: string;
  offset: number;
  limit: number;
}
