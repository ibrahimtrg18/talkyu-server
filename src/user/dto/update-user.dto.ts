import { IsOptional, IsDefined, IsNotEmpty, IsString } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  email: string;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  phoneNumber: string;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  newPassword: string;

  @IsDefined()
  @IsNotEmpty()
  @IsString()
  confirmPassword: string;
}
