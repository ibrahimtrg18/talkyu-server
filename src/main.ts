import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as express from 'express';
import * as morgan from 'morgan';
import * as path from 'path';

import { AppModule } from './app.module';
import { ValidationPipe } from './validation.pipe';

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
  app.useGlobalPipes(new ValidationPipe());

  console.log(configService.get('PORT'));

  await app.listen(configService.get('PORT') || 3000);
}
bootstrap();
