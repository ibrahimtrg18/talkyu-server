import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { ResponseResult } from 'src/utils/response';
import { Repository } from 'typeorm';
import { AcceptFriendDto } from './dto/accept-friend.dto';
import { CreateFriendDto } from './dto/create-friend.dto';
import { RequestFriendDto } from './dto/request-friend.dto';
import { UpdateFriendDto } from './dto/update-friend.dto';
import { Friend, FriendStatus } from './entities/friend.entity';

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

  async requestFriend(
    requestFriendDto: RequestFriendDto,
  ): Promise<ResponseResult> {
    const user = await this.userRepository.findOne(requestFriendDto.user.id);
    const friend = await this.userRepository.findOne(
      requestFriendDto.friend.id,
    );

    const isExist = await this.friendRepository
      .createQueryBuilder('friend')
      .innerJoinAndSelect('friend.user', 'user')
      .where('friend.user = :userId', {
        userId: user.id,
      })
      .andWhere('friend.friend = :friendId', {
        friendId: friend.id,
      })
      .getOne();

    if (!friend) {
      return [HttpStatus.NOT_FOUND, null, 'We dont find your friend id'];
    }

    if (isExist) {
      return [HttpStatus.CONFLICT, null, 'You already add him/her'];
    }

    const requestUser = new Friend();
    requestUser.user = user;
    requestUser.friend = friend;
    requestUser.status = FriendStatus.REQUEST;
    const createRequestUser = await this.friendRepository.save(requestUser);

    const agreementUser = new Friend();
    agreementUser.user = friend;
    agreementUser.friend = user;
    agreementUser.status = FriendStatus.AGREEMENT;
    const createAgreementUser = await this.friendRepository.save(agreementUser);

    return [HttpStatus.OK, 'Sent request friend!', createRequestUser];
  }

  async acceptFriend(
    acceptFriendDto: AcceptFriendDto,
  ): Promise<ResponseResult> {
    const user = await this.userRepository.findOne(acceptFriendDto.user.id);
    const friend = await this.userRepository.findOne(acceptFriendDto.friend.id);

    if (!friend) {
      return [HttpStatus.NOT_FOUND, null, "We couldn't find request friend id"];
    }

    const isAlreadySendRequestFriend = await this.friendRepository
      .createQueryBuilder('friend')
      .innerJoinAndSelect('friend.user', 'user')
      .where('friend.user = :userId', {
        userId: user.id,
      })
      .andWhere('friend.friend = :friendId', {
        friendId: friend.id,
      })
      .andWhere('friend.status = :status', {
        status: FriendStatus.REQUEST,
      })
      .getOne();

    if (isAlreadySendRequestFriend) {
      return [
        HttpStatus.CONFLICT,
        null,
        'You already sent him request friend Him/Her!',
      ];
    }

    const isAlreadyAcceptRequestFriend = await this.friendRepository
      .createQueryBuilder('friend')
      .innerJoinAndSelect('friend.user', 'user')
      .where('friend.user = :userId', {
        userId: user.id,
      })
      .andWhere('friend.friend = :friendId', {
        friendId: friend.id,
      })
      .andWhere('friend.status = :status', {
        status: FriendStatus.ACCEPT,
      })
      .getOne();

    if (isAlreadyAcceptRequestFriend) {
      return [HttpStatus.CONFLICT, 'You already accept request friend!', null];
    }

    await this.friendRepository
      .createQueryBuilder('friend')
      .update()
      .set({ status: FriendStatus.ACCEPT })
      .where('friend.userId = :userId', {
        userId: user.id,
      })
      .andWhere('friend.friendId = :friendId', {
        friendId: friend.id,
      })
      .andWhere(
        '(friend.status = :statusAgreement) OR (friend.status = :statusRequest)',
        {
          statusAgreement: FriendStatus.AGREEMENT,
          statusRequest: FriendStatus.REQUEST,
        },
      )
      .execute();

    return [HttpStatus.NO_CONTENT, 'Accept request friend!', null];
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
