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

import { BookingRepository } from '../repositories/booking.repository';
import { SpaceRepository } from '../repositories/space.repository';
import { UserRepository } from '../repositories/user.repository';
import { BookIn, BookOut, GetBookingsIn } from '../types/booking.type';
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
  async isAvailable(@Root() bookingSlot: BookingSlot, @Ctx() ctx: Context) {
    if (new Date(bookingSlot.date) < getDateToday()) return false;

    const userId = getUserIdFromContext(ctx);
    const user = userId
      ? await this.userRepo.findOne(userId, { relations: ['roles'] })
      : null;

    // Removed Role Check
    // if (!user || !user.roles.some((r) => r.value === 'USER')) return false;
    if (!user) return false;

    const existingBookingsCount = await this.bookingRepo.getCountOnDay(
      bookingSlot.space,
      bookingSlot.date
    );

    if (
      await this.bookingRepo.hasBookedOnDay(
        user,
        bookingSlot.space,
        bookingSlot.date
      )
    ) {
      return false;
    }

    return existingBookingsCount < bookingSlot.space.maxBookingsPerDay;
  }

  @Mutation(() => BookOut)
  @Authorized()
  async book(
    @Arg('spaceId') spaceId: string,
    @Arg('input') input: BookIn,
    @Ctx() ctx: Context
  ): Promise<BookOut> {
    const userId = getUserIdFromContextOrFail(ctx);
    const user = await this.userRepo.findOneOrFail(userId);

    const space = await this.spaceRepo.findOneOrFail(spaceId);

    const date = new Date(input.date);

    if (!(date instanceof Date) || isNaN(date.getTime())) {
      throw new GraphQLError('Invalid date given');
    }

    const today = getDateToday();

    if (date < today) {
      throw new GraphQLError('Date is in the past');
    }

    if (
      (await this.bookingRepo.getCountOnDay(space, input.date)) >=
      space.maxBookingsPerDay
    ) {
      return {
        errors: [
          {
            message:
              'Too many bookings! Please refresh this page to see the latest bookings',
          },
        ],
      };
    }

    if (await this.bookingRepo.hasBookedOnDay(user, space, input.date)) {
      throw new GraphQLError('Already booked this day');
    }

    const booking = await this.bookingRepo.createAndSave(
      input.date,
      space,
      user
    );

    return {
      booking,
    };
  }

  @Mutation(() => Boolean)
  @Authorized()
  async cancelBooking(
    @Arg('bookingId') bookingId: string,
    @Ctx() ctx: Context
  ) {
    const userId = getUserIdFromContextOrFail(ctx);

    const booking = await this.bookingRepo.findOneOrFail({
      where: { id: bookingId, user: { id: userId } },
    });

    const today = getDateToday();

    if (new Date(booking.date) < today) {
      throw new GraphQLError('Cannot cancel previous booking');
    }

    await this.bookingRepo.softDelete(booking.id);

    return true;
  }

  @Query(() => [BookingSlot])
  @Authorized()
  async getBookings(
    @Arg('spaceId') spaceId: string,
    @Arg('input') input: GetBookingsIn,
    @Ctx() ctx: Context
  ) {
    const userId = getUserIdFromContextOrFail(ctx);

    const rawBookings = await this.bookingRepo
      .createQueryBuilder('booking')
      .leftJoinAndSelect('booking.space', 'space')
      .leftJoinAndSelect('booking.user', 'user')
      .where('space.id = :spaceId', { spaceId })
      .andWhere('date BETWEEN :start AND :end', {
        start: input.start,
        end: input.end,
      })
      .getMany();

    const bookings = rawBookings.map((booking) => {
      const isTodayOrFuture = new Date(booking.date) >= getDateToday();
      const ownsBooking = booking.user.id === userId;
      booking.canCancel = isTodayOrFuture && ownsBooking;
      return booking;
    });

    const groupedBookings = bookings.reduce((slots, booking) => {
      let slotIndex = slots.findIndex((slot) => {
        return Date.parse(slot.date) === Date.parse(booking.date);
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
