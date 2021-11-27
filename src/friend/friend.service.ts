import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { ResponseResult } from 'src/utils/response';
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
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createFriendDto: CreateFriendDto): Promise<ResponseResult> {
    const user = await this.userRepository.findOne(createFriendDto.user.id);
    const friend = await this.userRepository.findOne(createFriendDto.friend.id);

    const isExist = await this.friendRepository.findOne({
      where: { user, friend },
    });

    if (!friend) {
      return [HttpStatus.NOT_FOUND, null, 'We dont find your friend id'];
    }

    if (isExist) {
      return [HttpStatus.CONFLICT, null, 'You already add him/her'];
    }

    const newFriend = new Friend();
    newFriend.user = user;
    newFriend.friend = friend;

    return [
      HttpStatus.CREATED,
      'Successfully added a new friend',
      await this.friendRepository.save(newFriend),
    ];
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
