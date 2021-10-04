import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Conversation } from 'src/conversation/entities/conversation.entity';
import { Friend } from 'src/friend/entities/friend.entity';
import { isEmail } from 'src/utils/validation';
import { Like, Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginGoogleUserDto, LoginUserDto } from './dto/login-user.dto';
import { SearchUserDto } from './dto/search-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { validate } from 'uuid';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Friend)
    private friendRepository: Repository<Friend>,
    @InjectRepository(Conversation)
    private conversationRepository: Repository<Conversation>,
  ) {}

  async register(
    createUserDto: CreateUserDto,
  ): Promise<[HttpStatus, CreateUserDto & User]> {
    const isEmailExist = await this.findOneByEmail(createUserDto.email);

    if (isEmailExist) {
      return [HttpStatus.CONFLICT, null];
    }

    return [null, await this.userRepository.save(createUserDto)];
  }

  async registerGoogle({
    email,
    name,
    google_open_id,
  }): Promise<[HttpStatus, CreateUserDto & User]> {
    const isEmailExist = await this.findOneByEmail(email);

    if (isEmailExist) {
      return [HttpStatus.CONFLICT, null];
    }

    return [
      null,
      await this.userRepository.save({
        email,
        name,
        password: '',
        google_open_id,
      }),
    ];
  }

  async findByQuery(searchUserDto: SearchUserDto) {
    const { q } = searchUserDto;

    if (validate(q)) {
      return await this.userRepository.find({
        id: q,
      });
    } else if (isEmail(q)) {
      return await this.userRepository.find({
        email: q,
      });
    } else {
      return await this.userRepository.find({
        name: Like(`%${q}%`),
      });
    }
  }

  async findOneById(id: string) {
    return await this.userRepository.findOne(id);
  }

  async findOneByEmail(email: string) {
    return await this.userRepository.findOne({ email });
  }

  async findByLogin(loginUserDto: LoginUserDto | LoginGoogleUserDto) {
    return await this.userRepository.findOne(loginUserDto);
  }

  async updateAccount(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<[HttpStatus, CreateUserDto & User]> {
    const isPasswordMatch = await this.userRepository.findOne({
      password: updateUserDto.password,
    });

    if (!isPasswordMatch) {
      return [HttpStatus.FORBIDDEN, null];
    }

    const user = await this.userRepository.findOne({
      id,
    });

    if (!user) {
      return [HttpStatus.NOT_FOUND, null];
    }

    const { password, ...rest } = updateUserDto;

    return [null, await this.userRepository.save({ ...user, ...rest })];
  }

  async getFriends(id: string) {
    return await this.friendRepository.find({
      relations: ['user'],
      where: { user: { id } },
    });
  }

  async getConversations(id: string) {
    return await this.conversationRepository
      .createQueryBuilder('conversation')
      .leftJoinAndSelect('conversation.user', 'user')
      .where('user.id = :id', { id })
      .getMany();
  }
}
