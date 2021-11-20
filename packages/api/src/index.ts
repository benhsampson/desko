import { ApolloServer, ApolloError } from 'apollo-server-express';
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import { GraphQLError } from 'graphql';
import Redis from 'ioredis';
import { buildSchema } from 'type-graphql';
import { createConnection } from 'typeorm';

import { DEFAULT_DB_PORT, DEFAULT_PORT } from './constants';
import { StatusResolver } from './resolvers/status.resolver';
import { UserResolver } from './resolvers/user.resolver';
import { User } from './entities/user.entity';
import { authChecker } from './utils/authChecker';
import { Context } from './types/Context';

dotenv.config();

const PORT = parseInt(process.env.PORT || DEFAULT_PORT, 10);
const DB_PORT = parseInt(process.env.DB_PORT || DEFAULT_DB_PORT, 10);
const REDIS_PORT =
  process.env.REDIS_PORT?.length && parseInt(process.env.REDIS_PORT, 10);

(async () => {
  await createConnection({
    type: 'mysql',
    port: DB_PORT,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    // logging: process.env.NODE_ENV !== 'production',
    synchronize: process.env.NODE_ENV !== 'production',
    entities: [User],
  });
  const app = express();
  app.use(
    cors({
      origin: process.env.WEB_URL,
      credentials: true,
    })
  );
  const redis = new Redis(REDIS_PORT, process.env.REDIS_HOST);
  const schema = await buildSchema({
    resolvers: [StatusResolver, UserResolver],
    emitSchemaFile: true,
    authChecker,
  });
  const apolloServer = new ApolloServer({
    schema,
    context: (ctx) => ({ ...ctx, redis } as Context),
    formatError: (error: GraphQLError) => {
      if (!(error.originalError instanceof ApolloError)) {
        console.log(JSON.stringify(error));
        return new GraphQLError('Internal error');
      }
      return error;
    },
  });
  await apolloServer.start();
  apolloServer.applyMiddleware({ app, cors: false });
  app.listen(PORT, () => console.log(`App listening on port ${PORT}`));
})().catch((err) => console.error(err));
