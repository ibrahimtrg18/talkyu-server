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

export class LoginGoogleUserDto {
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  idToken: string;

  @IsDefined()
  @IsNotEmpty()
  @IsString()
  serverAuthCode: string;
}
