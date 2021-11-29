import { AuthenticationError } from 'apollo-server-errors';
import { GraphQLError } from 'graphql';
import * as jwt from 'jsonwebtoken';
import ms from 'ms';

import {
  ACCESS_TOKEN_EXPIRES_IN,
  REFRESH_TOKEN_COOKIE_NAME,
  REFRESH_TOKEN_EXPIRES_IN,
  REFRESH_TOKEN_REDIS_PREFIX,
} from '../constants';
import { Context } from '../types/Context';

// const IS_PROD = process.env.NODE_ENV === 'production';

const generateTokens = (payload: object) => {
  if (!process.env.ACCESS_TOKEN_SECRET || !process.env.REFRESH_TOKEN_SECRET) {
    throw new GraphQLError('Missing access/refresh token secret');
  }

  const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRES_IN,
  });
  const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRES_IN,
  });

  const accessTokenExpiry = new Date(
    new Date().getTime() + ms(ACCESS_TOKEN_EXPIRES_IN)
  );

  const refreshTokenExpiry = new Date(
    new Date().getTime() + ms(REFRESH_TOKEN_EXPIRES_IN)
  );

  return {
    accessToken,
    refreshToken,
    accessTokenExpiry,
    refreshTokenExpiry,
  };
};

type TokenPayload = { id: string };

const generateUserTokens = (userId: string) =>
  generateTokens({ id: userId } as TokenPayload);

const getRefreshTokenKey = (userId: string) =>
  `${REFRESH_TOKEN_REDIS_PREFIX}:${userId}`;

export const deleteRefreshTokenCookieAndAssociation = async (
  ctx: Context,
  userId: string
) => {
  await ctx.redis.del(getRefreshTokenKey(userId));

  ctx.res.clearCookie(REFRESH_TOKEN_COOKIE_NAME);
};

export const validateRefreshToken = async (
  ctx: Context,
  refreshToken: string
) => {
  if (!process.env.REFRESH_TOKEN_SECRET) {
    throw new GraphQLError('Missing refresh token secret');
  }

  const { id } = jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET
  ) as TokenPayload;

  if ((await ctx.redis.get(getRefreshTokenKey(id))) !== refreshToken) {
    throw new GraphQLError('Already used this refresh token');
  }

  return id;
};

export const authenticate = async (ctx: Context, userId: string) => {
  const { accessToken, refreshToken, accessTokenExpiry } =
    generateUserTokens(userId);

  await ctx.redis.set(getRefreshTokenKey(userId), refreshToken);

  ctx.res.cookie(REFRESH_TOKEN_COOKIE_NAME, refreshToken, {
    httpOnly: false,
    // TODO: Change once HTTPS is in place
    // secure: IS_PROD,
    secure: false,
    domain: process.env.COOKIE_DOMAIN,
  });

  console.log('NEW REFRESH TOKEN', refreshToken);

  return { accessToken, accessTokenExpiry };
};

export const validateAccessToken = (accessToken: string) => {
  if (!process.env.ACCESS_TOKEN_SECRET) {
    throw new GraphQLError('Missing access token secret');
  }

  try {
    const { id } = jwt.verify(
      accessToken,
      process.env.ACCESS_TOKEN_SECRET
    ) as TokenPayload;

    return id;
  } catch (err) {
    throw new AuthenticationError('Invalid JWT');
  }
};

export const getUserIdFromContext = (ctx: Context) => {
  const accessToken = ctx.req.headers.authorization?.split(' ')[1];
  return accessToken ? validateAccessToken(accessToken) : null;
};

export const getUserIdFromContextOrFail = (ctx: Context) => {
  const userId = getUserIdFromContext(ctx);
  if (!userId) {
    throw new GraphQLError('Unauthenticated');
  }
  return userId;
};
