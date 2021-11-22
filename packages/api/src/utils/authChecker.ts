import { AuthenticationError } from 'apollo-server-errors';
import { AuthChecker } from 'type-graphql';
import { getCustomRepository } from 'typeorm';

import { UserRepository } from '../repositories/user.repository';
import { getUserIdFromContext } from '../services/user.service';
import { Context } from '../types/Context';

export const authChecker: AuthChecker<Context> = async ({ context }, roles) => {
  const userId = getUserIdFromContext(context);

  if (userId) {
    const user = await getCustomRepository(UserRepository).findOne(userId, {
      relations: ['roles'],
    });
    return (
      !!user &&
      (roles.length === 0 ||
        user.roles.some((role) => roles.includes(role.value)))
    );
  } else {
    throw new AuthenticationError('Unauthorized');
  }
};
