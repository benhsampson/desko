import argon2 from 'argon2';
import 'reflect-metadata';
import { Arg, Authorized, Ctx, Mutation, Query, Resolver } from 'type-graphql';
import { getCustomRepository } from 'typeorm';
import { v4 as uuid } from 'uuid';

import { UserRepository } from '../repositories/user.repository';
import {
  validateRefreshToken,
  authenticate,
  deleteRefreshTokenCookieAndAssociation,
  getUserIdFromContextOrFail,
  getUserIdFromContext,
} from '../services/user.service';
import {
  changePasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
} from '../validators/user.validator';
import { validateInput } from '../utils/validateInput';
import {
  AuthOut,
  ChangePasswordIn,
  ChangePasswordOut,
  ForgotPasswordIn,
  ForgotPasswordOut,
  LoginIn,
  RefreshTokenIn,
  RegisterIn,
  ResetPasswordIn,
  ResetPasswordOut,
} from '../types/user.type';
import { Context } from '../types/Context';
import { User } from '../entities/user.entity';
import {
  FORGOT_PASSWORD_REDIS_PREFIX,
  FORGOT_PASSWORD_TOKEN_EXPIRES_IN,
} from '../constants';
import ms from 'ms';
import { sendEmail } from '../utils/sendEmail';
import { TypeOf } from 'yup';

@Resolver()
export class UserResolver {
  userRepository = getCustomRepository(UserRepository);

  @Mutation(() => AuthOut)
  async register(
    @Arg('input') input: RegisterIn,
    @Ctx() ctx: Context
  ): Promise<AuthOut> {
    const { errors } = await validateInput<
      RegisterIn,
      TypeOf<typeof registerSchema>
    >(registerSchema, input);

    if (errors) {
      return { errors };
    }

    const hashedPassword = await argon2.hash(input.password);
    const user = await this.userRepository.createAndSave(
      input.fullName,
      input.email,
      hashedPassword,
      input.role
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

  @Mutation(() => ChangePasswordOut)
  @Authorized()
  async changePassword(
    @Arg('input') input: ChangePasswordIn,
    @Ctx() ctx: Context
  ): Promise<ChangePasswordOut> {
    const { errors } = await validateInput(changePasswordSchema, input);

    if (errors) {
      return { errors };
    }

    const userId = getUserIdFromContextOrFail(ctx);

    const hashedPassword = await argon2.hash(input.newPassword);

    const user = await this.userRepository.findOneOrFail(userId);
    await this.userRepository.updatePasswordAndSave(user, hashedPassword);

    return {};
  }

  @Query(() => Boolean)
  isAuthenticated(@Ctx() ctx: Context) {
    return !!getUserIdFromContext(ctx);
  }

  @Query(() => User)
  @Authorized()
  async userInfo(@Ctx() ctx: Context): Promise<User> {
    const userId = getUserIdFromContextOrFail(ctx);

    return this.userRepository.findOneOrFail(userId, { relations: ['roles'] });
  }

  @Mutation(() => Boolean)
  @Authorized()
  async logout(@Ctx() ctx: Context) {
    const userId = getUserIdFromContextOrFail(ctx);

    await deleteRefreshTokenCookieAndAssociation(ctx, userId);

    return true;
  }

  @Mutation(() => ForgotPasswordOut)
  async forgotPassword(
    @Arg('input') input: ForgotPasswordIn,
    @Ctx() ctx: Context
  ): Promise<ForgotPasswordOut> {
    const user = await this.userRepository.findByEmail(input.email);

    if (!user) {
      return {
        errors: [{ path: 'email', message: 'No user with this email' }],
      };
    }

    const token = uuid();

    await ctx.redis.set(
      `${FORGOT_PASSWORD_REDIS_PREFIX}:${token}`,
      user.id,
      'ex',
      ms(FORGOT_PASSWORD_TOKEN_EXPIRES_IN)
    );

    if (process.env.WEB_URL) {
      await sendEmail(
        'Desko.io - Reset your password',
        input.email,
        `<a href="${process.env.WEB_URL}/reset-password/${token}">Reset password</a>`
      );
    }

    return { token };
  }

  @Mutation(() => ResetPasswordOut)
  async resetPassword(
    @Arg('token') token: string,
    @Arg('input') input: ResetPasswordIn,
    @Ctx() ctx: Context
  ): Promise<ResetPasswordOut> {
    const { errors } = await validateInput(resetPasswordSchema, input);

    if (errors) {
      return { errors };
    }

    const key = `${FORGOT_PASSWORD_REDIS_PREFIX}:${token}`;
    const userId = await ctx.redis.get(key);

    if (!userId) {
      return { errors: [{ message: 'invalid token' }] };
    }

    const user = await this.userRepository.findOneOrFail(userId);
    const hashedNewPassword = await argon2.hash(input.password);

    await this.userRepository.updatePasswordAndSave(user, hashedNewPassword);

    await ctx.redis.del(key);

    return {};
  }
}
