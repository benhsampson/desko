import { NextPage } from 'next';
import Link from 'next/link';
import { useCallback, useMemo } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import FullCalendar from '@fullcalendar/react';
import interactionPlugin from '@fullcalendar/interaction';
import dayGridPlugin from '@fullcalendar/daygrid';
import {
  EventInput,
  DateSelectArg,
  EventClickArg,
  EventContentArg,
  DayCellContentArg,
} from '@fullcalendar/common';

import {
  useBookMutation,
  useCancelBookingMutation,
  useGetBookingsQuery,
  useSpaceInfoQuery,
  useUserInfoQuery,
} from '../../../__generated__/graphql';
import { useQueryVar } from '../../../lib/utils/useQueryVar';
import withApollo from '../../../lib/utils/withApollo';
import getBaseUrl from '../../../lib/utils/getBaseUrl';
import Navbar from '../../../components/Navbar';
import withAuth from '../../../lib/utils/withAuth';

type Props = {
  prettyBaseUrl: string;
  rawBaseUrl: string;
};

const SpacePage: NextPage<Props> = ({ prettyBaseUrl, rawBaseUrl }) => {
  const spaceId = useQueryVar('id') || '404';

  const userInfo = useUserInfoQuery();
  const spaceInfo = useSpaceInfoQuery({
    variables: { spaceId },
  });
  const getBookings = useGetBookingsQuery({
    variables: { spaceId },
  });
  const [book] = useBookMutation({
    refetchQueries: ['GetBookings'],
  });
  const [cancelBooking] = useCancelBookingMutation({
    refetchQueries: ['GetBookings'],
  });

  const events = useMemo(() => {
    const _events: EventInput[] = [];

    getBookings.data?.getBookings.forEach((slot) => {
      const dateStr = slot.date as string;
      const startDate = new Date(dateStr);

      if (!slot.available) {
        _events.push({
          id: dateStr,
          display: 'background',
          start: startDate,
          extendedProps: {
            isBackground: true,
          },
        });
      }

      slot.bookings.forEach((booking) =>
        _events.push({
          id: booking.id,
          title: booking.user.fullName,
          start: startDate,
          extendedProps: {
            available: slot.available,
          },
        })
      );
    });

    return _events;
  }, [getBookings.data?.getBookings]);

  const handleDateSelect = useCallback(
    async (selectInfo: DateSelectArg) => {
      const calendarApi = selectInfo.view.calendar;
      calendarApi.unselect();

      const { errors } = await book({
        variables: {
          spaceId,
          year: selectInfo.start.getFullYear(),
          month: selectInfo.start.getMonth(),
          day: selectInfo.start.getDate(),
        },
      });

      if (errors) return console.error(errors);
    },
    [book, spaceId]
  );

  const handleEventClick = useCallback(
    async (clickInfo: EventClickArg) => {
      console.log(clickInfo.event);

      if (
        clickInfo.event.extendedProps.isBackground ||
        !clickInfo.event.start ||
        clickInfo.event.start.getTime() < new Date().setHours(0, 0, 0, 0)
      )
        return;

      await cancelBooking({
        variables: { bookingId: clickInfo.event.id },
      });
    },
    [cancelBooking]
  );

  const renderEventContent = (eventContent: EventContentArg) => (
    <div>{eventContent.event.title}</div>
  );

  const renderDayCellContent = ({
    dayNumberText,
    isPast,
  }: DayCellContentArg) => (
    <div style={{ backgroundColor: isPast ? 'gray' : 'white' }}>
      {dayNumberText}
    </div>
  );

  return (
    <Navbar>
      {!spaceInfo.loading ? (
        !spaceInfo.error && spaceInfo.data ? (
          <div>
            <h1>{spaceInfo.data.spaceInfo.name}</h1>
            <p>
              max bookings per day: {spaceInfo.data.spaceInfo.maxBookingsPerDay}
            </p>
            {!userInfo.loading ? (
              !userInfo.error && userInfo.data ? (
                userInfo.data.userInfo.roles[0].value === 'MANAGER' ? (
                  <div>
                    <CopyToClipboard
                      text={`${rawBaseUrl}/invite/${spaceInfo.data.spaceInfo.code}`}
                    >
                      <button>{`${prettyBaseUrl}/invite/${spaceInfo.data.spaceInfo.code}`}</button>
                    </CopyToClipboard>
                    <Link href={`/space/${spaceId}/edit`}>Edit</Link>
                  </div>
                ) : null
              ) : (
                <p>{userInfo.error?.message}</p>
              )
            ) : (
              <p>loading...</p>
            )}
            {!getBookings.loading ? (
              !getBookings.error && getBookings.data ? (
                <div>
                  <FullCalendar
                    plugins={[interactionPlugin, dayGridPlugin]}
                    events={events}
                    selectAllow={({ start }) => {
                      return start.getTime() >= new Date().setHours(0, 0, 0, 0);
                    }}
                    selectOverlap={(event) => !!event.extendedProps.available}
                    select={handleDateSelect}
                    eventClick={handleEventClick}
                    dayMaxEventRows={4}
                    eventContent={renderEventContent}
                    dayCellContent={renderDayCellContent}
                    defaultAllDay
                    selectable
                  />
                </div>
              ) : (
                <p>{getBookings.error?.message}</p>
              )
            ) : (
              <p>loading..</p>
            )}
          </div>
        ) : (
          <p>{spaceInfo.error?.message}</p>
        )
      ) : (
        <p>loading...</p>
      )}
    </Navbar>
  );
};

SpacePage.getInitialProps = async (ctx) => {
  const { pretty, raw } = await Promise.resolve(getBaseUrl(ctx.req));
  return { prettyBaseUrl: pretty, rawBaseUrl: raw };
};

export default withApollo(withAuth(SpacePage));
