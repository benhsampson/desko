import { Arg, Authorized, Ctx, Mutation, Resolver } from 'type-graphql';
import { getCustomRepository } from 'typeorm';

import { SpaceRepository } from '../repositories/space.repository';
import { UserRepository } from '../repositories/user.repository';
import { getUserIdFromContextOrFail } from '../services/user.service';
import { Context } from '../types/Context';
import { CreateSpaceIn, CreateSpaceOut } from '../types/space.type';
import { validateInput } from '../utils/validateInput';
import { createSpaceSchema } from '../validators/space.validator';

@Resolver()
export class SpaceResolver {
  userRepository = getCustomRepository(UserRepository);
  spaceRepository = getCustomRepository(SpaceRepository);

  @Mutation(() => CreateSpaceOut)
  @Authorized('MANAGER')
  async createSpace(
    @Arg('input') input: CreateSpaceIn,
    @Ctx() ctx: Context
  ): Promise<CreateSpaceOut> {
    const { errors } = await validateInput(createSpaceSchema, input);

    if (errors) return { errors };

    const userId = getUserIdFromContextOrFail(ctx);
    const user = await this.userRepository.findOneOrFail(userId);

    await this.spaceRepository.createAndSaveSpace(
      input.name,
      input.maxBookingsPerDay,
      user
    );

    return {};
  }
}
