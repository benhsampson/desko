import { Field, InputType, ObjectType } from 'type-graphql';
import { Booking } from '../entities/booking.entity';
import { UserError } from './UserError';

@InputType()
export class GetBookingsIn {
  @Field()
  start!: string;

  @Field()
  end!: string;
}

@InputType()
export class BookIn {
  @Field()
  date!: string;
}

@ObjectType()
export class BookOut {
  @Field(() => [UserError], { nullable: true })
  errors?: UserError[];

  @Field(() => Booking, { nullable: true })
  booking?: Booking;
}
