import { Field, Int, ObjectType } from 'type-graphql';
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Booking } from './booking.entity';
import { User } from './user.entity';

@Entity()
@ObjectType()
export class Space {
  @PrimaryGeneratedColumn('uuid')
  @Field()
  id!: string;

  @Column()
  @Field()
  name!: string;

  @Column()
  @Field(() => Int)
  maxBookingsPerDay!: number;

  @Column({ unique: true })
  @Field()
  code!: string;

  @ManyToOne(() => User, (user) => user.managedSpaces)
  @Field(() => User)
  manager!: User;

  @ManyToMany(() => User)
  @JoinTable()
  @Field(() => [User])
  users!: User[];

  @OneToMany(() => Booking, (booking) => booking.space)
  @Field(() => [Booking])
  bookings!: Booking[];
}
