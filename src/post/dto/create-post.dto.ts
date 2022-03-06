import { Payload } from '../../interfaces/payload.interface';

export class CreatePostDto {
  user: Payload;
  file: string;
  description: string;
  path: string;
}
