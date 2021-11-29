import { Controller, Get } from '@nestjs/common';

import { AppService } from './app.service';
import { EmailService } from './email/email.service';
@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly emailService: EmailService,
  ) {}

  @Get()
  getHello(): string {
    this.emailService.sendMail();
    return this.appService.getHello();
  }
}
