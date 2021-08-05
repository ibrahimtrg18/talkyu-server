import { Injectable } from '@nestjs/common';
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

  register(createUserDto: CreateUserDto) {
    return this.usersRepository.save(createUserDto);
  }

  findAll(name: string) {
    return this.usersRepository.find({ name: Like(`%${name}%`) });
  }

  findOneById(id: string) {
    return this.usersRepository.findOne(id);
  }

  findByLogin(loginUserDto: LoginUserDto) {
    return this.usersRepository.findOne(loginUserDto);
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
