import { IsDefined, IsNotEmpty, IsString } from 'class-validator';

export class TokenUserDto {
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  token: string;
}
