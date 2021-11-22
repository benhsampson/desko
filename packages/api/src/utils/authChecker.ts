import { AuthenticationError } from 'apollo-server-errors';
import { AuthChecker } from 'type-graphql';
import { getCustomRepository } from 'typeorm';

import { UserRepository } from '../repositories/user.repository';
import { getUserIdFromContext } from '../services/user.service';
import { Context } from '../types/Context';

export const authChecker: AuthChecker<Context> = async ({ context }, roles) => {
  const userId = getUserIdFromContext(context);
  const user =
    userId &&
    (await getCustomRepository(UserRepository).findOne(userId, {
      relations: ['roles'],
    }));
  const authorized =
    !!user &&
    (roles.length === 0 ||
      (await user.roles).some((role) => roles.includes(role.value)));

  if (!authorized)
    throw new AuthenticationError('Unauthorized/unauthenticated');

  return authorized;
};
