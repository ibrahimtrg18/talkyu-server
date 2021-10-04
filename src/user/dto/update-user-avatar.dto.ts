import { IsDefined, IsNotEmpty } from 'class-validator';

export class UpdateUserAvatarDto {
  @IsDefined()
  @IsNotEmpty()
  file: string;
}
