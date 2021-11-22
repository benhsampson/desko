import { ApolloServer, ApolloError } from 'apollo-server-express';
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import { GraphQLError } from 'graphql';
import Redis from 'ioredis';
import { buildSchema } from 'type-graphql';
import { createConnection } from 'typeorm';

import { DEFAULT_PORT } from './constants';
import { StatusResolver } from './resolvers/status.resolver';
import { UserResolver } from './resolvers/user.resolver';
import { SpaceResolver } from './resolvers/space.resolver';
import { User } from './entities/user.entity';
import { Space } from './entities/space.entity';
import { Role } from './entities/role.entity';
import { authChecker } from './utils/authChecker';
import { Context } from './types/Context';
import connectionOptions from './ormconfig';

dotenv.config();

const PORT = parseInt(process.env.PORT || DEFAULT_PORT, 10);
// const DB_PORT = parseInt(process.env.DB_PORT || DEFAULT_DB_PORT, 10);
const REDIS_PORT =
  process.env.REDIS_PORT?.length && parseInt(process.env.REDIS_PORT, 10);

(async () => {
  await createConnection({
    ...connectionOptions,
    entities: [User, Role, Space],
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
    resolvers: [StatusResolver, UserResolver, SpaceResolver],
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
