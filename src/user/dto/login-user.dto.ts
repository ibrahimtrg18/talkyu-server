import { IsDefined, IsNotEmpty, IsString } from 'class-validator';

export class LoginUserDto {
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  email: string;

  @IsDefined()
  @IsNotEmpty()
  @IsString()
  password?: string;
}

export class LoginToken {
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  token: string;
}
