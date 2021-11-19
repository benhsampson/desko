import { ExpressContext } from 'apollo-server-express';
import { Redis } from 'ioredis';

export type Context = ExpressContext & {
  redis: Redis;
};
