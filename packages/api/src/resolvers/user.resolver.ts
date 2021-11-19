import argon2 from 'argon2';
import 'reflect-metadata';
import { Arg, Authorized, Ctx, Mutation, Query, Resolver } from 'type-graphql';
import { getCustomRepository } from 'typeorm';

import { UserRepository } from '../repositories/user.repository';
import {
  validateRefreshToken,
  authenticate,
  deleteRefreshTokenCookieAndAssociation,
  getUserIdFromContextOrFail,
} from '../services/user.service';
import { loginSchema, registerSchema } from '../validators/user.validator';
import { validateInput } from '../utils/validateInput';
import {
  AuthOut,
  LoginIn,
  RefreshTokenIn,
  RegisterIn,
} from '../types/user.type';
import { Context } from '../types/Context';
import { User } from '../entities/user.entity';

@Resolver()
export class UserResolver {
  userRepository = getCustomRepository(UserRepository);

  @Query(() => User)
  @Authorized()
  async userInfo(@Ctx() ctx: Context): Promise<User> {
    const userId = getUserIdFromContextOrFail(ctx);

    return this.userRepository.findOneOrFail(userId);
  }

  @Mutation(() => AuthOut)
  async register(
    @Arg('input') input: RegisterIn,
    @Ctx() ctx: Context
  ): Promise<AuthOut> {
    const { errors } = await validateInput(registerSchema, input);

    if (errors) {
      return { errors };
    }

    const hashedPassword = await argon2.hash(input.password);
    const user = await this.userRepository.createAndSave(
      input.fullName,
      input.email,
      hashedPassword
    );

    const { accessToken, accessTokenExpiry } = await authenticate(ctx, user.id);

    return { accessToken, accessTokenExpiry };
  }

  @Mutation(() => AuthOut)
  async login(
    @Arg('input') input: LoginIn,
    @Ctx() ctx: Context
  ): Promise<AuthOut> {
    const { errors } = await validateInput(loginSchema, input);

    if (errors) {
      return { errors };
    }

    const user = await this.userRepository.findByEmail(input.email);

    if (!user || !(await argon2.verify(user.password, input.password))) {
      return { errors: [{ message: 'Invalid email or password' }] };
    }

    const { accessToken, accessTokenExpiry } = await authenticate(ctx, user.id);

    return { accessToken, accessTokenExpiry };
  }

  @Mutation(() => AuthOut)
  async refreshToken(
    @Arg('input') input: RefreshTokenIn,
    @Ctx() ctx: Context
  ): Promise<AuthOut> {
    const userId = await validateRefreshToken(ctx, input.refreshToken);

    await this.userRepository.findOneOrFail(userId);

    const { accessToken, accessTokenExpiry } = await authenticate(ctx, userId);

    return { accessToken, accessTokenExpiry };
  }

  @Mutation(() => Boolean)
  @Authorized()
  async logout(@Ctx() ctx: Context): Promise<boolean> {
    const userId = getUserIdFromContextOrFail(ctx);

    await deleteRefreshTokenCookieAndAssociation(ctx, userId);

    return true;
  }
}
