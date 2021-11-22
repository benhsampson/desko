import { Field, Int, ObjectType } from 'type-graphql';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
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

  @ManyToOne(() => User, (user) => user.spaces)
  @Field(() => User)
  user!: User;
}
