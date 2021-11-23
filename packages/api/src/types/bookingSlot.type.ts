import { Field, ObjectType } from 'type-graphql';
import { Booking } from '../entities/booking.entity';
import { Space } from '../entities/space.entity';

@ObjectType()
export class BookingSlot {
  @Field(() => Date)
  date!: Date;

  @Field(() => Space)
  space!: Space;

  @Field(() => [Booking])
  bookings!: Booking[];

  @Field({ nullable: true })
  available?: boolean;
}
