import { Arg, Authorized, Ctx, Mutation, Query, Resolver } from 'type-graphql';
import { getCustomRepository } from 'typeorm';

import { Space } from '../entities/space.entity';
import { SpaceRepository } from '../repositories/space.repository';
import { UserRepository } from '../repositories/user.repository';
import { getUserIdFromContextOrFail } from '../services/user.service';
import { Context } from '../types/Context';
import {
  CreateSpaceIn,
  CreateSpaceOut,
  JoinSpaceOut,
  UpdateSpaceIn,
  UpdateSpaceOut,
} from '../types/space.type';
import { validateInput } from '../utils/validateInput';
import {
  createSpaceSchema,
  updateSpaceSchema,
} from '../validators/space.validator';

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

  @Mutation(() => UpdateSpaceOut)
  @Authorized('MANAGER')
  async updateSpace(
    @Arg('spaceId') spaceId: string,
    @Arg('input') input: UpdateSpaceIn,
    @Ctx() ctx: Context
  ): Promise<UpdateSpaceOut> {
    const { errors } = await validateInput(updateSpaceSchema, input);

    if (errors) return { errors };

    const userId = getUserIdFromContextOrFail(ctx);
    const space = await this.spaceRepository.findOneOrFail(spaceId, {
      where: { id: spaceId, manager: { id: userId } },
    });

    await this.spaceRepository.updateAndSaveSpace(space, input);

    return {
      space,
    };
  }

  @Query(() => [Space])
  @Authorized('MANAGER')
  async managerSpaces(@Ctx() ctx: Context): Promise<Space[]> {
    const userId = getUserIdFromContextOrFail(ctx);
    const user = await this.userRepository.findOneOrFail(userId);

    return this.spaceRepository.getManagerSpaces(user);
  }

  @Query(() => Space)
  @Authorized()
  async spaceInfo(@Arg('spaceId') spaceId: string): Promise<Space> {
    // TODO: Check that we have joined/are a manager of this space.

    return this.spaceRepository.findOneOrFail(spaceId, {
      relations: ['manager'],
    });
  }

  @Mutation(() => JoinSpaceOut)
  @Authorized()
  async joinSpace(@Arg('code') code: string, @Ctx() ctx: Context) {
    const userId = getUserIdFromContextOrFail(ctx);
    const user = await this.userRepository.findOneOrFail(userId, {
      relations: ['roles'],
    });

    const space = await this.spaceRepository.findOne(
      { code },
      { relations: ['users'] }
    );

    if (!space) {
      return {
        errors: [
          {
            message: 'Invalid link, request a new one from your space manager',
          },
        ],
      };
    }

    await this.spaceRepository.joinSpace(user, space);

    return {
      space,
    };
  }

  @Query(() => [Space])
  @Authorized()
  async joinedSpaces(@Ctx() ctx: Context): Promise<Space[]> {
    const userId = getUserIdFromContextOrFail(ctx);
    const user = await this.userRepository.findOneOrFail(userId);

    return this.spaceRepository.getJoinedSpaces(user);
  }
}
