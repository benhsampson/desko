import { Field, ObjectType } from 'type-graphql';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { Space } from './space.entity';
import { User } from './user.entity';

@Entity()
@ObjectType()
export class Booking {
  @PrimaryGeneratedColumn('uuid')
  @Field()
  id!: string;

  @Column('timestamp')
  @Field(() => Date)
  date!: Date;

  @ManyToOne(() => Space, (space) => space.bookings)
  space!: Space;

  @ManyToOne(() => User, (user) => user.bookings)
  user!: User;
}
