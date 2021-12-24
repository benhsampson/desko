import dotenvFlow from 'dotenv-flow';
dotenvFlow.config();

import { ApolloServer, ApolloError } from 'apollo-server-express';
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
import { BookingResolver } from './resolvers/booking.resolver';
import { authChecker } from './utils/authChecker';
import { Context } from './types/Context';
import connectionOptions from './ormconfig';

const PORT = parseInt(process.env.API_PORT || DEFAULT_PORT, 10);

(async () => {
  await createConnection(connectionOptions);
  const app = express();
  app.use(
    cors({
      origin: process.env.WEB_URL,
      credentials: true,
    })
    // cors()
  );
  const redis = new Redis(process.env.REDIS_URL);
  const schema = await buildSchema({
    resolvers: [StatusResolver, UserResolver, SpaceResolver, BookingResolver],
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
