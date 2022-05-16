import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request, Response } from 'express';
import * as fs from 'fs';
import { diskStorage } from 'multer';
import * as path from 'path';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { User } from '../decorators/user.decorator';
import { Payload } from '../interfaces/payload.interface';
import { response } from '../utils/response';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostService } from './post.service';

@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req: Request, file, cb) => {
          const { id } = req.user as Payload;
          const destination = `./public/uploads/user/${id}/post/`;
          fs.mkdirSync(destination, { recursive: true });
          cb(null, destination);
        },
        filename: function (req: Request, file, cb) {
          const { id } = req.user as Payload;
          cb(null, `${id}-${Date.now()}${path.extname(file.originalname)}`);
        },
      }),
      fileFilter: function (req: Request, file, cb) {
        if (
          file.mimetype !== 'image/png' &&
          file.mimetype !== 'image/jpg' &&
          file.mimetype !== 'image/jpeg'
        ) {
          return cb(new Error('Extension not allowed'), false);
        }
        return cb(null, true);
      },
    }),
  )
  async create(
    @User() user: Payload,
    @Res() res: Response,
    @UploadedFile() file: Express.Multer.File,
    @Body() createPostDto: CreatePostDto,
  ) {
    try {
      if (!file) {
        return response(
          res,
          HttpStatus.BAD_REQUEST,
          "File key: 'file' is required!",
          null,
        );
      }

      const [status, message, post] = await this.postService.create({
        user,
        ...createPostDto,
        file: file.filename,
        path: path.normalize(file.path.replace('public', '')),
      });

      return response(res, status, message, post);
    } catch (e) {
      console.error(e);
      return response(res, HttpStatus.INTERNAL_SERVER_ERROR, e, null);
    }
  }

  @Get()
  findAll() {
    return this.postService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Res() res: Response) {
    try {
      const [status, message, post] = await this.postService.findPostById(id);
      return response(res, status, message, post);
    } catch (e) {
      console.error(e);
      return response(res, HttpStatus.INTERNAL_SERVER_ERROR, e, null);
    }
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePostDto: UpdatePostDto) {
    return this.postService.update(+id, updatePostDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.postService.remove(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/like')
  async like(
    @Res() res: Response,
    @Param('id') id: string,
    @User() user: Payload,
  ) {
    try {
      const [status, message, post] = await this.postService.likePostById(
        id,
        user.id,
      );
      return response(res, status, message, post);
    } catch (e) {
      console.error(e);
      return response(res, HttpStatus.INTERNAL_SERVER_ERROR, e, null);
    }
  }
}
