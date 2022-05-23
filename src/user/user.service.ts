import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { validate } from 'uuid';

import { Conversation } from '../conversation/entities/conversation.entity';
import { Friend, FriendStatus } from '../friend/entities/friend.entity';
import { Post } from '../post/entities/post.entity';
import { comparePassword, generatePassword } from '../utils/password';
import { isEmail } from '../utils/validation';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { SearchUserDto } from './dto/search-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Friend)
    private friendRepository: Repository<Friend>,
    @InjectRepository(Conversation)
    private conversationRepository: Repository<Conversation>,
    @InjectRepository(Post)
    private postRepository: Repository<Post>,
    private configService: ConfigService,
  ) {}

  SALT = this.configService.get('SALT');

  async register(createUserDto: CreateUserDto): Promise<User> {
    try {
      const { password, ...restCreateUserDto } = createUserDto;

      const newUser = await this.userRepository.save({
        ...restCreateUserDto,
        password: await generatePassword(password, parseInt(this.SALT)),
      });

      return newUser;
    } catch (error) {
      console.error(error);
      throw new Error(error);
    }
  }

  async registerWithGoogle({ email, name, google_open_id }) {
    try {
      const newUser = await this.userRepository.save({
        email,
        name,
        password: '',
        google_open_id,
      });

      return newUser;
    } catch (error) {
      console.error(error);
      throw new Error(error);
    }
  }

  async findByQuery(searchUserDto: SearchUserDto) {
    try {
      const { user, q, offset = 0, limit = 10 } = searchUserDto;

      if (validate(q)) {
        const results = await this.userRepository.find({
          select: ['id', 'name', 'email', 'created_at', 'updated_at'],
          where: {
            id: q,
          },
          skip: offset,
          take: limit,
        });

        return results;
      } else if (isEmail(q)) {
        const results = await this.userRepository.find({
          select: ['id', 'name', 'email', 'created_at', 'updated_at'],
          where: {
            email: q,
          },
          skip: offset,
          take: limit,
        });
        return results;
      } else {
        const results = await this.userRepository
          .createQueryBuilder('user')
          .leftJoinAndSelect(
            'user.friends',
            'friend',
            'friend.friendId = :userId',
            {
              userId: user.id,
              status: FriendStatus.ACCEPT,
            },
          )
          .where('user.id != :userId', { userId: user.id })
          .loadRelationCountAndMap(
            'user.total_friends',
            'user.friends',
            'total_friends',
            (qb) =>
              qb.where('total_friends.status = :status', {
                status: FriendStatus.ACCEPT,
              }),
          )
          .skip(offset)
          .limit(limit)
          .getMany();

        return results;
      }
    } catch (error) {
      console.error(error);
      throw new Error(error);
    }
  }

  async findOneById(id: string) {
    try {
      const user = await this.userRepository.findOne(id);

      return user;
    } catch (error) {
      console.error(error);
      throw new Error(error);
    }
  }

  async findOneByEmail(email: string) {
    try {
      return await this.userRepository.findOne({ email });
    } catch (error) {
      console.error(error);
      throw new Error(error);
    }
  }

  async findByLogin(loginUserDto: LoginUserDto) {
    try {
      const { password, ...restLoginUserDto } = loginUserDto;

      if (password) {
        const user = await this.userRepository.findOne({ ...restLoginUserDto });
        if (!user) {
          return null;
        }

        const isMatch = await comparePassword(password, user.password);
        if (isMatch) {
          return user;
        }

        return null;
      }

      return null;
    } catch (error) {
      console.error(error);
      throw new Error(error);
    }
  }

  async findByGoogleAccount(email: string, google_open_id: string) {
    try {
      return this.userRepository.findOne({
        email,
        google_open_id,
      });
    } catch (error) {
      console.error(error);
      throw new Error(error);
    }
  }

  async update(user: User) {
    const { password, ...restUser } = user;

    const updatedUser = await this.userRepository.save({
      ...restUser,
      password: await generatePassword(password, parseInt(this.SALT)),
    });

    return updatedUser;
  }

  async updateAvatar(userId: string, avatarFilename: string) {
    try {
      const user = await this.userRepository.findOne(userId);

      const update = await this.userRepository.save({
        ...user,
        avatar: avatarFilename,
      });

      return update;
    } catch (error) {
      console.error(error);
      throw new Error(error);
    }
  }

  async getFriends(userId: string) {
    try {
      const friends = await this.friendRepository
        .createQueryBuilder('friend')
        .leftJoinAndSelect('friend.user', 'friendUser')
        .leftJoinAndSelect('friend.friend', 'friendFriend')
        .where('friendUser.id = :userId', { userId })
        .getMany();

      const revampFriends = friends.map((friend) => friend.friend);

      return revampFriends;
    } catch (error) {
      console.error(error);
      throw new Error(error);
    }
  }

  async getConversations(userId: string) {
    try {
      const userConversation = await this.userRepository
        .createQueryBuilder('user')
        .leftJoinAndSelect('user.conversations', 'conversation')
        .where('user.id = :userId', { userId })
        .getOne();

      const conversations = userConversation.conversations;

      if (conversations.length === 0) {
        return [];
      }

      const users = await this.conversationRepository
        .createQueryBuilder('conversation')
        .leftJoinAndSelect('conversation.users', 'user')
        .where('user.id != :userId', { userId })
        .andWhere('conversation.id IN(:conversationId)', {
          conversationId: conversations.map((conversation) => conversation.id),
        })
        .getMany();

      return users;
    } catch (error) {
      console.error(error);
      throw new Error(error);
    }
  }

  async findPostsByUserId(userId: string) {
    try {
      const posts = await this.postRepository
        .createQueryBuilder('post')
        .leftJoinAndSelect('post.user', 'user')
        .where('post.userId = :userId', { userId })
        .orderBy('post.created_at', 'DESC')
        .getMany();

      return posts;
    } catch (error) {
      console.error(error);
      throw new Error(error);
    }
  }
}
