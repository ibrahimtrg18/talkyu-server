import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsNotEmpty, IsString } from 'class-validator';

import { Payload } from '../../interfaces/payload.interface';

export class CreatePostDto {
  user: Payload;

  @ApiProperty({ type: 'string', format: 'binary' })
  file: any;

  @ApiProperty()
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  description: string;

  path: string;
}
