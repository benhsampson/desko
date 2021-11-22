import { EntityRepository, Repository } from 'typeorm';
import { Space } from '../entities/space.entity';
import { User } from '../entities/user.entity';

@EntityRepository(Space)
export class SpaceRepository extends Repository<Space> {
  createAndSaveSpace(name: string, maxBookingsPerDay: number, user: User) {
    const space = new Space();
    space.name = name;
    space.maxBookingsPerDay = maxBookingsPerDay;
    space.user = user;
    return this.save(space);
  }
}
