import { GraphQLError } from 'graphql';
import {
  Arg,
  Authorized,
  Mutation,
  Resolver,
  Ctx,
  FieldResolver,
  Root,
  ResolverInterface,
  Query,
} from 'type-graphql';
import { getCustomRepository } from 'typeorm';

import { Booking } from '../entities/booking.entity';
import { BookingRepository } from '../repositories/booking.repository';
import { SpaceRepository } from '../repositories/space.repository';
import { UserRepository } from '../repositories/user.repository';
import { BookIn } from '../types/booking.type';
import { Context } from '../types/Context';
import {
  getUserIdFromContext,
  getUserIdFromContextOrFail,
} from '../services/user.service';
import { BookingSlot } from '../types/bookingSlot.type';
import { getDateToday } from '../utils/getToday';

@Resolver(() => BookingSlot)
export class BookingResolver implements ResolverInterface<BookingSlot> {
  bookingRepo = getCustomRepository(BookingRepository);
  spaceRepo = getCustomRepository(SpaceRepository);
  userRepo = getCustomRepository(UserRepository);

  @FieldResolver()
  async available(@Root() bookingSlot: BookingSlot, @Ctx() ctx: Context) {
    if (bookingSlot.date < getDateToday()) return false;

    const userId = getUserIdFromContext(ctx);
    const user = userId
      ? await this.userRepo.findOne(userId, { relations: ['roles'] })
      : null;

    if (!user || !user.roles.some((r) => r.value === 'USER')) return false;

    const existingBookingsCount = await this.bookingRepo.getCountOnDay(
      bookingSlot.date
    );

    if (await this.bookingRepo.hasBookedOnDay(user, bookingSlot.date))
      return false;

    return existingBookingsCount < bookingSlot.space.maxBookingsPerDay;
  }

  @Mutation(() => Booking)
  @Authorized('USER')
  async book(
    @Arg('spaceId') spaceId: string,
    @Arg('input') input: BookIn,
    @Ctx() ctx: Context
  ): Promise<Booking> {
    const userId = getUserIdFromContextOrFail(ctx);
    const user = await this.userRepo.findOneOrFail(userId);

    const space = await this.spaceRepo.findOneOrFail(spaceId);

    const date = new Date(input.year, input.month, input.day);

    if (!(date instanceof Date) || isNaN(date.getTime())) {
      throw new GraphQLError('Invalid date given');
    }

    const today = getDateToday();

    if (date < today) {
      throw new GraphQLError('Date is in the past');
    }

    if (
      (await this.bookingRepo.getCountOnDay(date)) >= space.maxBookingsPerDay
    ) {
      throw new GraphQLError('Too many bookings');
    }

    if (await this.bookingRepo.hasBookedOnDay(user, date)) {
      throw new GraphQLError('Already booked this day');
    }

    return this.bookingRepo.createAndSave(date, space, user);
  }

  @Mutation(() => Boolean)
  @Authorized('USER')
  async cancelBooking(
    @Arg('bookingId') bookingId: string,
    @Ctx() ctx: Context
  ) {
    const userId = getUserIdFromContextOrFail(ctx);

    const booking = await this.bookingRepo.findOneOrFail({
      where: { id: bookingId, user: { id: userId } },
    });

    const today = getDateToday();

    if (booking.date < today) {
      throw new GraphQLError('Cannot cancel previous booking');
    }

    await this.bookingRepo.softDelete(booking.id);

    return true;
  }

  @Query(() => [BookingSlot])
  @Authorized()
  async getBookings(@Arg('spaceId') spaceId: string) {
    const bookings = await this.bookingRepo.find({
      where: { space: { id: spaceId } },
      relations: ['space', 'user'],
    });

    const groupedBookings = bookings.reduce((slots, booking) => {
      let slotIndex = slots.findIndex((slot) => {
        return slot.date.getTime() === booking.date.getTime();
      });

      if (slotIndex === -1) {
        const newSlot = new BookingSlot();
        newSlot.date = booking.date;
        newSlot.space = booking.space;
        newSlot.bookings = [];
        slotIndex = slots.push(newSlot) - 1;
      }

      slots[slotIndex].bookings.push(booking);
      return slots;
    }, [] as BookingSlot[]);

    return groupedBookings;
  }
}
