import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from '../user/entities/user.entity';
import { Friend, FriendStatus } from './entities/friend.entity';

@Injectable()
export class FriendService {
  constructor(
    @InjectRepository(Friend)
    private readonly friendRepository: Repository<Friend>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findByUserIdAndFriendId(userId: string, friendId: string) {
    try {
      return await this.friendRepository.findOne({
        user: {
          id: userId,
        },
        friend: {
          id: friendId,
        },
      });
    } catch (error) {
      console.error(error);
      throw new Error(error);
    }
  }

  async create({ user, friend }: { user: User; friend: User }) {
    try {
      const newFriend = new Friend();
      newFriend.user = user;
      newFriend.friend = friend;

      const addedFriend = await this.friendRepository.save(newFriend);

      return addedFriend;
    } catch (error) {
      console.error(error);
      throw new Error(error);
    }
  }

  async requestFriend({ user, friend }: { user: User; friend: User }) {
    try {
      const agreementUser = new Friend();
      agreementUser.user = friend;
      agreementUser.friend = user;
      agreementUser.status = FriendStatus.AGREEMENT;
      await this.friendRepository.save(agreementUser);

      const requestUser = new Friend();
      requestUser.user = user;
      requestUser.friend = friend;
      requestUser.status = FriendStatus.REQUEST;
      const createRequestUser = await this.friendRepository.save(requestUser);

      return createRequestUser;
    } catch (error) {
      console.error(error);
      throw new Error(error);
    }
  }

  async findFriendUserByStatus({
    user,
    friend,
    status,
  }: {
    user: User;
    friend: User;
    status: FriendStatus;
  }) {
    try {
      return await this.friendRepository
        .createQueryBuilder('friend')
        .innerJoinAndSelect('friend.user', 'user')
        .where('friend.user = :userId', {
          userId: user.id,
        })
        .andWhere('friend.friend = :friendId', {
          friendId: friend.id,
        })
        .andWhere('friend.status = :status', {
          status: status,
        })
        .getOne();
    } catch (error) {
      console.error(error);
      throw new Error(error);
    }
  }

  async acceptFriend({ user, friend }: { user: User; friend: User }) {
    try {
      const acceptedFriend = await this.friendRepository
        .createQueryBuilder('friend')
        .update()
        .set({ status: FriendStatus.ACCEPT })
        .where(
          '((friend.userId = :userId) AND (friend.friendId = :friendId) OR (friend.userId = :friendId) AND (friend.friendId = :userId))',
          {
            userId: user.id,
            friendId: friend.id,
          },
        )
        .andWhere(
          '(friend.status = :statusAgreement) OR (friend.status = :statusRequest)',
          {
            statusAgreement: FriendStatus.AGREEMENT,
            statusRequest: FriendStatus.REQUEST,
          },
        )
        .execute();

      return acceptedFriend;
    } catch (error) {
      console.error(error);
      throw new Error(error);
    }
  }
}
