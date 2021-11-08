import * as morgan from 'morgan';
import * as express from 'express';
import * as path from 'path';
import {
  BadRequestException,
  HttpStatus,
  ValidationError,
  ValidationPipe,
} from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get<ConfigService>(ConfigService);
  app.use(morgan('tiny'));
  app.setGlobalPrefix('api');

  const config = new DocumentBuilder()
    .setTitle('Talky')
    .setDescription('Talky Rest API')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('/openapi', app, document);

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

  console.log(configService.get('PORT'));

  await app.listen(configService.get('PORT') || 3000);
}
bootstrap();
