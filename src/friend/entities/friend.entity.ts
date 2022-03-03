import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { User } from '../../user/entities/user.entity';

export enum FriendStatus {
  REQUEST = 'REQUEST',
  AGREEMENT = 'AGREEMENT',
  ACCEPT = 'ACCEPT',
}

@Entity()
export class Friend {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  status: FriendStatus;

  total_friends: number;

  @ManyToOne(() => User, (user) => user.friends)
  user: User;

  @ManyToOne(() => User, (user) => user.friends)
  friend: User;

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  public created_at: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
    onUpdate: 'CURRENT_TIMESTAMP(6)',
  })
  public updated_at: Date;
}
