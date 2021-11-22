import { EntityRepository, Repository } from 'typeorm';
import { nanoid } from 'nanoid';

import { Space } from '../entities/space.entity';
import { User } from '../entities/user.entity';
import { UpdateSpaceIn } from '../types/space.type';

@EntityRepository(Space)
export class SpaceRepository extends Repository<Space> {
  createAndSaveSpace(name: string, maxBookingsPerDay: number, user: User) {
    const space = new Space();
    space.name = name;
    space.maxBookingsPerDay = maxBookingsPerDay;
    space.code = nanoid();
    space.manager = user;
    return this.save(space);
  }

  updateAndSaveSpace(space: Space, input: UpdateSpaceIn) {
    space.name = input.name || space.name;
    space.maxBookingsPerDay =
      input.maxBookingsPerDay || space.maxBookingsPerDay;
    return this.save(space);
  }

  getManagerSpaces(user: User) {
    return this.find({ where: { manager: user } });
  }

  async joinSpace(user: User, space: Space) {
    space.users.push(user);
    return this.save(space);
  }

  getJoinedSpaces(user: User) {
    return this.createQueryBuilder('space')
      .leftJoinAndSelect('space.users', 'user')
      .where(':userId = user.id', { userId: user.id })
      .getMany();
  }
}
