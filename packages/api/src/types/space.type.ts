import { Field, InputType, Int, ObjectType } from 'type-graphql';
import { UserError } from './UserError';

@InputType()
export class CreateSpaceIn {
  @Field()
  name!: string;

  @Field(() => Int)
  maxBookingsPerDay!: number;
}

@InputType()
export class UpdateSpaceIn {
  @Field({ nullable: true })
  name?: string;

  @Field(() => Int, { nullable: true })
  maxBookingsPerDay?: number;
}

@ObjectType()
export class CreateSpaceOut {
  @Field(() => [UserError], { nullable: true })
  errors?: UserError[];
}

@ObjectType()
export class JoinSpaceOut {
  @Field(() => [UserError], { nullable: true })
  errors?: UserError[];
}

@ObjectType()
export class UpdateSpaceOut {
  @Field(() => [UserError], { nullable: true })
  errors?: UserError[];
}
