import {
  BadRequestException,
  HttpStatus,
  ValidationError,
  ValidationPipe,
} from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      exceptionFactory: (errors: ValidationError[]) => {
        let errorObj = {};
        errors.forEach((error) => {
          errorObj = {
            ...errorObj,
            [error.property]: error.constraints,
          };
        });
        return new BadRequestException({
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Object Transfer Data has errors',
          error: errorObj,
        });
      },
    }),
  );
  await app.listen(3000);
}
bootstrap();
