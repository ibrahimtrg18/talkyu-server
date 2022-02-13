import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Conversation } from '../../conversation/entities/conversation.entity';
import { User } from '../../user/entities/user.entity';

export enum ChatType {
  TEXT = 'TEXT',
  FILE = 'FILE',
}

@Entity()
export class Chat {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('simple-json')
  message: any;

  @Column()
  type: ChatType;

  @ManyToOne(() => User, (user) => user.conversations)
  user: User;

  @ManyToOne(() => Conversation, (conversation) => conversation.chats)
  conversation: Conversation;

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
