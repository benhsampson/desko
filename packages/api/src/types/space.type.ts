import { Field, InputType, Int, ObjectType } from 'type-graphql';
import { UserError } from './UserError';

@InputType()
export class CreateSpaceIn {
  @Field()
  name!: string;

  @Field(() => Int)
  maxBookingsPerDay!: number;
}

@ObjectType()
export class CreateSpaceOut {
  @Field(() => [UserError], { nullable: true })
  errors?: UserError[];
}
