import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Conversation } from '../../conversation/entities/conversation.entity';
import { Friend } from '../../friend/entities/friend.entity';
import { Post } from '../../post/entities/post.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column()
  password?: string;

  @Column({ nullable: true, default: null })
  phoneNumber: string;

  @Column({ nullable: true, default: null })
  avatar: string;

  @Column({ nullable: true, default: 0 })
  online: boolean;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  lastOnline: Date;

  @Column({ nullable: true, default: null })
  google_open_id: string;

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  created_at: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
    onUpdate: 'CURRENT_TIMESTAMP(6)',
  })
  updated_at: Date;

  @OneToMany(() => Post, (post) => post.user)
  posts: Post[];

  @ManyToMany(() => Post, (post) => post.like_by_users)
  @JoinTable({ name: 'user_like' })
  liked_post: Post[];

  @OneToMany(() => Friend, (friend) => friend.user)
  friends: Friend[];

  total_friends: number;

  @ManyToMany(() => Conversation, (conversation) => conversation.users)
  @JoinTable({ name: 'user_conversation' })
  conversations: Conversation[];
}
