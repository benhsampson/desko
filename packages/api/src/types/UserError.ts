import { Field, ObjectType } from 'type-graphql';

@ObjectType()
export class UserError {
  @Field()
  message!: string;

  @Field({ nullable: true })
  path?: string;
}
