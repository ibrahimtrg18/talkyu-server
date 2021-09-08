import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Friend } from 'src/friend/entities/friend.entity';
import { Like, Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginGoogleUserDto, LoginUserDto } from './dto/login-user.dto';
import { SearchUserDto } from './dto/search-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Friend)
    private friendRepository: Repository<Friend>,
  ) {}

  async register(
    createUserDto: CreateUserDto,
  ): Promise<[HttpStatus, CreateUserDto & User]> {
    const isEmailExist = await this.findOneByEmail(createUserDto.email);

    if (isEmailExist) {
      return [HttpStatus.CONFLICT, null];
    }

    return [null, await this.usersRepository.save(createUserDto)];
  }

  async registerGoogle({
    email,
    name,
    googleOpenId,
  }): Promise<[HttpStatus, CreateUserDto & User]> {
    const isEmailExist = await this.findOneByEmail(email);

    if (isEmailExist) {
      return [HttpStatus.CONFLICT, null];
    }

    return [
      null,
      await this.usersRepository.save({
        email,
        name,
        password: '',
        googleOpenId,
      }),
    ];
  }

  findByQuery(searchUserDto: SearchUserDto) {
    return this.usersRepository.find(searchUserDto);
  }

  async findOneById(id: string) {
    return await this.usersRepository.findOne(id);
  }

  findOneByEmail(email: string) {
    return this.usersRepository.findOne({ email });
  }

  findByLogin(loginUserDto: LoginUserDto | LoginGoogleUserDto) {
    return this.usersRepository.findOne(loginUserDto);
  }

  async updateAccount(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<[HttpStatus, CreateUserDto & User]> {
    const isPasswordMatch = await this.usersRepository.findOne({
      password: updateUserDto.password,
    });

    if (!isPasswordMatch) {
      return [HttpStatus.FORBIDDEN, null];
    }

    const user = await this.usersRepository.findOne({
      id,
    });

    if (!user) {
      return [HttpStatus.NOT_FOUND, null];
    }

    const { password, ...rest } = updateUserDto;

    return [null, await this.usersRepository.save({ ...user, ...rest })];
  }

  async getFriends(id: string) {
    return await this.friendRepository.find({
      relations: ['user'],
      where: { user: { id } },
    });
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
