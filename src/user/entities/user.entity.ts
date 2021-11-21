import { Conversation } from 'src/conversation/entities/conversation.entity';
import { Friend } from 'src/friend/entities/friend.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

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

  @Column()
  online: string;

  @Column()
  lastOnline: string;

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
