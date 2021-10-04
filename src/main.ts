import {
  BadRequestException,
  HttpStatus,
  ValidationError,
  ValidationPipe,
} from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as morgan from 'morgan';
import * as express from 'express';
import * as path from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(morgan('tiny'));
  app.setGlobalPrefix('api');
  app.use('/api', express.static(path.join(__dirname, '..', 'public')));
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
