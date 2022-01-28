import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { validate } from 'uuid';

import { Conversation } from '../conversation/entities/conversation.entity';
import { Friend } from '../friend/entities/friend.entity';
import { comparePassword, generatePassword } from '../utils/password';
import { ResponseResult } from '../utils/response';
import { isEmail } from '../utils/validation';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { SearchUserDto } from './dto/search-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Friend)
    private friendRepository: Repository<Friend>,
    @InjectRepository(Conversation)
    private conversationRepository: Repository<Conversation>,
    private configService: ConfigService,
  ) {}

  SALT = this.configService.get('SALT');

  async register(createUserDto: CreateUserDto): Promise<ResponseResult> {
    const isEmailExist = await this.findOneByEmail(createUserDto.email);

    if (isEmailExist) {
      return [HttpStatus.CONFLICT, 'Email is already register!', null];
    }

    const { password, ...restCreateUserDto } = createUserDto;

    return [
      HttpStatus.CREATED,
      'Successfully register new account!',
      await this.userRepository.save({
        ...restCreateUserDto,
        password: await generatePassword(password, parseInt(this.SALT)),
      }),
    ];
  }

  async registerGoogle({
    email,
    name,
    google_open_id,
  }): Promise<ResponseResult> {
    const isEmailExist = await this.findOneByEmail(email);

    if (isEmailExist) {
      return [HttpStatus.CONFLICT, 'Email is already register!', null];
    }

    return [
      HttpStatus.CREATED,
      'Successfully register new account!',
      await this.userRepository.save({
        email,
        name,
        password: '',
        google_open_id,
      }),
    ];
  }

  async findByQuery(searchUserDto: SearchUserDto): Promise<ResponseResult> {
    const { q } = searchUserDto;

    if (validate(q)) {
      const results = await this.userRepository.find({
        select: ['id', 'name', 'email', 'created_at', 'updated_at'],
        where: {
          id: q,
        },
      });

      return [HttpStatus.OK, `Found ${results.length} users!`, results];
    } else if (isEmail(q)) {
      const results = await this.userRepository.find({
        select: ['id', 'name', 'email', 'created_at', 'updated_at'],
        where: {
          email: q,
        },
      });
      return [HttpStatus.OK, `Found ${results.length} users!`, results];
    } else {
      const results = await this.userRepository.find({
        select: ['id', 'name', 'email', 'created_at', 'updated_at'],
        where: {
          name: Like(`%${q}%`),
        },
      });
      return [HttpStatus.OK, `Found ${results.length} users!`, results];
    }
  }

  async findOneById(id: string): Promise<ResponseResult> {
    const user = await this.userRepository.findOne(id);

    if (!user) {
      return [HttpStatus.NOT_FOUND, `Found user!`, user];
    }

    return [HttpStatus.OK, `Found user!`, user];
  }

  async findOneByEmail(email: string) {
    return await this.userRepository.findOne({ email });
  }

  async findByLogin(loginUserDto: LoginUserDto) {
    const { password, ...restLoginUserDto } = loginUserDto;

    if (password) {
      const user = await this.userRepository.findOne({ ...restLoginUserDto });
      const isMatch = await comparePassword(password, user.password);
      if (isMatch) {
        return user;
      }

      return null;
    }

    return null;
  }

  async updateAccount(
    userId: string,
    updateUserDto: UpdateUserDto,
  ): Promise<ResponseResult> {
    const isPasswordMatch = await this.userRepository.findOne({
      id: userId,
      password: updateUserDto.confirmPassword,
    });

    if (!isPasswordMatch) {
      return [HttpStatus.FORBIDDEN, 'Password is incorrect!', null];
    }

    const user = await this.userRepository.findOne({
      id: userId,
    });

    if (!user) {
      return [HttpStatus.NOT_FOUND, "Sorry, We can't find your account!", null];
    }

    const { confirmPassword, newPassword, ...rest } = updateUserDto;

    // changes password
    if (newPassword) {
      const { password, ...updatedUser } = await this.userRepository.save({
        ...user,
        ...rest,
        password: newPassword,
      });

      return [HttpStatus.OK, 'Successfully changes password!', updatedUser];
    }

    // changes data
    return [
      HttpStatus.OK,
      'Successfully changes password!',
      await this.userRepository.save({ ...user, ...rest }),
    ];
  }

  async updateAvatar(
    userId: string,
    avatarFilename: string,
  ): Promise<ResponseResult> {
    const user = await this.userRepository.findOne(userId);

    const update = await this.userRepository.save({
      ...user,
      avatar: avatarFilename,
    });

    return [HttpStatus.OK, 'Successfully updated avatar', update];
  }

  async getFriends(id: string): Promise<ResponseResult> {
    const friends = await this.friendRepository
      .createQueryBuilder('friend')
      .leftJoinAndSelect('friend.user', 'friendUser')
      .leftJoinAndSelect('friend.friend', 'friendFriend')
      .where('friendUser.id = :id', { id })
      .getMany();

    return [HttpStatus.OK, `You have ${friends.length} friends!`, friends];
  }

  async getConversations(userId: string): Promise<ResponseResult> {
    const userConversation = await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.conversations', 'conversation')
      .where('user.id = :userId', { userId })
      .getOne();

    const conversations = userConversation.conversations;

    if (conversations.length === 0) {
      return [HttpStatus.OK, `You have 0 conversations!`, []];
    }

    const users = await this.conversationRepository
      .createQueryBuilder('conversation')
      .leftJoinAndSelect('conversation.users', 'user')
      .where('user.id != :userId', { userId })
      .andWhere('conversation.id IN(:conversationId)', {
        conversationId: conversations.map((conversation) => conversation.id),
      })
      .getMany();

    return [HttpStatus.OK, `You have ${users.length} conversations!`, users];
  }
}
