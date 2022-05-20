import { Field, ObjectType } from 'type-graphql';
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
import { Booking } from './booking.entity';
import { Role } from './role.entity';
import { Space } from './space.entity';

@Entity()
@ObjectType()
export class User {
  @PrimaryGeneratedColumn('uuid')
  @Field()
  id!: string;

  @Column()
  @Field()
  fullName!: string;

  @Column({ unique: true })
  @Field()
  email!: string;

  @Column()
  @Field()
  password!: string;

  @ManyToMany(() => Role, (role) => role.users)
  @JoinTable()
  @Field(() => [Role])
  roles!: Role[];

  @OneToMany(() => Space, (space) => space.manager)
  managedSpaces!: Space[];

  @OneToMany(() => Booking, (booking) => booking.user)
  bookings!: Booking[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
