import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    auth: {
      user: 'dev.ibrahimtarigan@gmail.com',
      pass: process.env.GMAIL_PASSWORD,
    },
  });

  private mailOptions = {
    from: 'dev.ibrahimtarigan@gmail.com', // sender address
    to: 'ibrahimtarigan@gmail.com', // list of receivers
    subject: 'Subject of your email', // Subject line
    html: '<p>Your html here</p>', // plain text body
  };

  sendMail() {
    console.log(process.env.GMAIL_PASSWORD);
    this.transporter.sendMail(this.mailOptions, function (err, info) {
      if (err) console.log(err);
      else console.log(info);
    });
  }
}
