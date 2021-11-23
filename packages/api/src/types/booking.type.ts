import { Field, InputType, Int } from 'type-graphql';

@InputType()
export class BookIn {
  @Field(() => Int)
  year!: number;

  @Field(() => Int)
  month!: number;

  @Field(() => Int)
  day!: number;
}
