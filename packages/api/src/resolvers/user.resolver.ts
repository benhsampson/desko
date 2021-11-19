import argon2 from 'argon2';
import 'reflect-metadata';
import {
  Arg,
  Field,
  InputType,
  Mutation,
  ObjectType,
  Resolver,
} from 'type-graphql';
import { getCustomRepository } from 'typeorm';
import { UserRepository } from '../repositories/user.repository';

import { UserError } from '../types/UserError';
import { validateInput } from '../util/validateInput';
import { registerSchema } from '../validators/register';

@InputType()
export class RegisterIn {
  @Field()
  fullName!: string;

  @Field()
  email!: string;

  @Field()
  password!: string;
}

@ObjectType()
class RegisterOut {
  @Field(() => [UserError], { nullable: true })
  errors?: UserError[];

  @Field({ nullable: true })
  accessToken?: string;
}

@Resolver()
export class UserResolver {
  userRepository = getCustomRepository(UserRepository);

  @Mutation(() => RegisterOut)
  async register(@Arg('input') input: RegisterIn): Promise<RegisterOut> {
    const { errors } = await validateInput(registerSchema, input);

    if (errors) {
      return { errors };
    }

    const hashedPassword = await argon2.hash(input.password);
    await this.userRepository.createAndSave(
      input.fullName,
      input.email,
      hashedPassword
    );

    return {};
  }
}
