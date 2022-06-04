import {
  Controller,
  Delete,
  HttpStatus,
  Param,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { User } from '../decorators/user.decorator';
import { Payload } from '../interfaces/payload.interface';
import { response } from '../utils/response';
import { CommentService } from './comment.service';

@Controller('comment')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async remove(
    @Res() res: Response,
    @Param('id') id: string,
    @User() user: Payload,
  ) {
    try {
      const isCommentExist = await this.commentService.findById(id);

      if (!isCommentExist) {
        return response(
          res,
          HttpStatus.NOT_FOUND,
          'Failed: Comment not found!',
          isCommentExist,
        );
      }

      const isCommentCreatedByUser = await this.commentService.findByIdAndUserId(
        id,
        user.id,
      );

      if (!isCommentCreatedByUser) {
        return response(
          res,
          HttpStatus.FORBIDDEN,
          'Failed: Comment not created by user!',
          isCommentCreatedByUser,
        );
      }

      const deletedComment = await this.commentService.remove(id);

      return response(
        res,
        HttpStatus.ACCEPTED,
        'Successfully: Delete a post!',
        deletedComment,
      );
    } catch (error) {
      console.error(error);
      return response(res, HttpStatus.INTERNAL_SERVER_ERROR, error, null);
    }
  }
}
