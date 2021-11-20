import { AuthenticationError } from 'apollo-server-errors';
import { AuthChecker } from 'type-graphql';
import { getCustomRepository } from 'typeorm';

import { UserRepository } from '../repositories/user.repository';
import { getUserIdFromContext } from '../services/user.service';
import { Context } from '../types/Context';

export const authChecker: AuthChecker<Context> = async ({ context }) => {
  const userId = getUserIdFromContext(context);

  if (userId) {
    return !!(await getCustomRepository(UserRepository).findOne(userId));
  } else {
    throw new AuthenticationError('Unauthorized');
  }
};
