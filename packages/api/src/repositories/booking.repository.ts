import { EntityRepository, Repository } from 'typeorm';

import { Booking } from '../entities/booking.entity';
import { Space } from '../entities/space.entity';
import { User } from '../entities/user.entity';

@EntityRepository(Booking)
export class BookingRepository extends Repository<Booking> {
  createAndSave(date: Date, space: Space, user: User) {
    const booking = new Booking();
    booking.date = date;
    booking.space = space;
    booking.user = user;
    return this.manager.save(booking);
  }

  getCountOnDay(space: Space, day: Date) {
    return this.manager.count(Booking, { where: { date: day, space } });
  }

  async hasBookedOnDay(user: User, space: Space, day: Date) {
    return !!(await this.manager.findOne(Booking, {
      where: { date: day, user, space },
    }));
  }
}
