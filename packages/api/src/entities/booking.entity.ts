import { Field, ObjectType } from 'type-graphql';
import {
  Column,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Space } from './space.entity';
import { User } from './user.entity';

@Entity()
@ObjectType()
export class Booking {
  @PrimaryGeneratedColumn('uuid')
  @Field()
  id!: string;

  @Column('date')
  @Field()
  date!: string;

  @DeleteDateColumn()
  deletedAt?: Date;

  @ManyToOne(() => Space, (space) => space.bookings)
  space!: Space;

  @ManyToOne(() => User, (user) => user.bookings)
  @Field(() => User)
  user!: User;

  @Field({ nullable: true })
  canCancel?: boolean;
}
