import { Field, InputType, Int, ObjectType } from 'type-graphql';
import { Booking } from '../entities/booking.entity';
import { UserError } from './UserError';

@InputType()
export class BookIn {
  @Field(() => Int)
  year!: number;

  @Field(() => Int)
  month!: number;

  @Field(() => Int)
  day!: number;
}

@ObjectType()
export class BookOut {
  @Field(() => [UserError], { nullable: true })
  errors?: UserError[];

  @Field(() => Booking, { nullable: true })
  booking?: Booking;
}
