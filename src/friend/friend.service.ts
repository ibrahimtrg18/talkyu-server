import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { CreateFriendDto } from './dto/create-friend.dto';
import { UpdateFriendDto } from './dto/update-friend.dto';
import { Friend } from './entities/friend.entity';

@Injectable()
export class FriendService {
  constructor(
    @InjectRepository(Friend)
    private readonly friendRepository: Repository<Friend>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async create(createFriendDto: CreateFriendDto) {
    const newFriend = new Friend();

    const user = await this.usersRepository.findOne(createFriendDto.user.id);
    const friendTo = await this.usersRepository.findOne(
      createFriendDto.friendTo.id,
    );

    newFriend.user = user;
    newFriend.friend = friendTo;

    return await this.friendRepository.save(newFriend);
  }

  findAll() {
    return `This action returns all friend`;
  }

  findOne(id: number) {
    return `This action returns a #${id} friend`;
  }

  update(id: number, updateFriendDto: UpdateFriendDto) {
    return `This action updates a #${id} friend`;
  }

  remove(id: number) {
    return `This action removes a #${id} friend`;
  }
}
