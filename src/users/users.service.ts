import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
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

  findByName(name: string) {
    return this.usersRepository.find({ name: Like(`%${name}%`) });
  }

  findOneById(id: string) {
    return this.usersRepository.findOne(id);
  }

  findOneByEmail(email: string) {
    return this.usersRepository.findOne({ email });
  }

  findByLogin(loginUserDto: LoginUserDto) {
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

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
