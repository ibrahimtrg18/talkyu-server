import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import * as fs from 'fs';
import { diskStorage } from 'multer';
import * as path from 'path';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateCommentDto } from '../comment/dto/create-comment.dto';
import { User } from '../decorators/user.decorator';
import { Payload } from '../interfaces/payload.interface';
import { response } from '../utils/response';
import { CreatePostDto } from './dto/create-post.dto';
import { PostService } from './post.service';

@ApiTags('Post')
@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiConsumes('multipart/form-data')
  @ApiBearerAuth()
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
          "Failed: Field 'file' is required!",
          null,
        );
      }

      const post = await this.postService.create({
        user,
        ...createPostDto,
        file: file.filename,
        path: path.normalize(file.path.replace('public', '')),
      });

      return response(
        res,
        HttpStatus.CREATED,
        'Successfully: Create a new post!',
        post,
      );
    } catch (error) {
      console.error(error);
      return response(res, HttpStatus.INTERNAL_SERVER_ERROR, error, null);
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Res() res: Response) {
    try {
      const post = await this.postService.findById(id);

      if (!post) {
        return response(
          res,
          HttpStatus.NOT_FOUND,
          'Failed: Post not found!',
          null,
        );
      }

      return response(res, HttpStatus.OK, 'Successfully: Get Post!', post);
    } catch (error) {
      console.error(error);
      return response(res, HttpStatus.INTERNAL_SERVER_ERROR, error, null);
    }
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async deletePostById(
    @Res() res: Response,
    @Param('id') id: string,
    @User() user: Payload,
  ) {
    try {
      const post = await this.postService.findById(id);

      if (!post) {
        return response(
          res,
          HttpStatus.NOT_FOUND,
          'Failed: Post not found!',
          post,
        );
      }

      if (post.user.id !== user.id) {
        return response(
          res,
          HttpStatus.FORBIDDEN,
          'Failed: Dont have permission for deleting this post!',
          null,
        );
      }

      const deletedPost = await this.postService.remove(id);

      return response(
        res,
        HttpStatus.ACCEPTED,
        'Successfully: Delete a post!',
        deletedPost,
      );
    } catch (error) {
      console.error(error);
      return response(res, HttpStatus.INTERNAL_SERVER_ERROR, error, null);
    }
  }

  @Post(':id/like')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async like(
    @Res() res: Response,
    @Param('id') id: string,
    @User() user: Payload,
  ) {
    try {
      const post = await this.postService.findById(id);

      if (!post) {
        return response(
          res,
          HttpStatus.NOT_FOUND,
          'Failed: Post not found!',
          post,
        );
      }

      const isLiked = await this.postService.isLikedById(id);

      if (isLiked.length) {
        return response(res, HttpStatus.CONFLICT, 'Failed: Like a post!', null);
      }

      const likedPost = await this.postService.likePostById(id, user.id);

      return response(
        res,
        HttpStatus.ACCEPTED,
        'Successfully: Like a post!',
        likedPost,
      );
    } catch (error) {
      console.error(error);
      return response(res, HttpStatus.INTERNAL_SERVER_ERROR, error, null);
    }
  }

  @Post(':id/comment')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async comment(
    @Res() res: Response,
    @Param('id') id: string,
    @Body() createCommentDto: CreateCommentDto,
    @User() user: Payload,
  ) {
    try {
      const post = await this.postService.findById(id);

      if (!post) {
        return response(
          res,
          HttpStatus.NOT_FOUND,
          'Failed: Post not found!',
          post,
        );
      }

      const commentedPost = await this.postService.commentByPostId(
        id,
        createCommentDto,
        user.id,
      );

      return response(
        res,
        HttpStatus.ACCEPTED,
        'Successfully: Comment a post!',
        commentedPost,
      );
    } catch (error) {
      console.error(error);
      return response(res, HttpStatus.INTERNAL_SERVER_ERROR, error, null);
    }
  }
}
