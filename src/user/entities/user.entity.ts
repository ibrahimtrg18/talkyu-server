import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Conversation } from '../../conversation/entities/conversation.entity';
import { Friend } from '../../friend/entities/friend.entity';

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

  @Column()
  phoneNumber: string;

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

  @OneToMany(() => User, (user) => user.friends)
  friends: Friend[];

  @ManyToMany(() => User, (user) => user.conversations)
  conversations: Conversation[];
}
