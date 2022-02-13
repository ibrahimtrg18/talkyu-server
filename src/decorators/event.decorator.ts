import { SetMetadata } from '@nestjs/common';

export const Event = (event: string) => SetMetadata('event', event);
