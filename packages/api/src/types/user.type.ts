import { Field, InputType, ObjectType } from 'type-graphql';
import { UserError } from './UserError';

@InputType()
export class RegisterIn {
  @Field()
  fullName!: string;

  @Field()
  email!: string;

  @Field()
  password!: string;
}

@InputType()
export class LoginIn {
  @Field()
  email!: string;

  @Field()
  password!: string;
}

@InputType()
export class RefreshTokenIn {
  @Field()
  refreshToken!: string;
}

@ObjectType()
export class AuthOut {
  @Field(() => [UserError], { nullable: true })
  errors?: UserError[];

  @Field({ nullable: true })
  accessToken?: string;

  @Field({ nullable: true })
  accessTokenExpiry?: Date;
}
