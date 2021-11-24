import { NextPage } from 'next';
import Link from 'next/link';
import { useCallback, useMemo, useState } from 'react';
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
  UserError,
  useSpaceInfoQuery,
  useUserInfoQuery,
} from '../../../__generated__/graphql';
import { useQueryVar } from '../../../lib/utils/useQueryVar';
import withApollo from '../../../lib/utils/withApollo';
import getBaseUrl from '../../../lib/utils/getBaseUrl';
import Navbar from '../../../components/Navbar';
import withAuth from '../../../lib/utils/withAuth';
import { MAX_DAY_EVENT_ROWS } from '../../../lib/constants';
import ErrorList from '../../../components/ErrorList';

type Props = {
  prettyBaseUrl: string;
  rawBaseUrl: string;
};

const SpacePage: NextPage<Props> = ({ prettyBaseUrl, rawBaseUrl }) => {
  const spaceId = useQueryVar('id') || '404';

  const [globalErrors, setGlobalErrors] = useState<UserError[]>([]);

  const userInfo = useUserInfoQuery();
  const spaceInfo = useSpaceInfoQuery({
    variables: { spaceId },
  });
  const getBookings = useGetBookingsQuery({
    variables: { spaceId },
    fetchPolicy: 'no-cache',
  });
  const [book] = useBookMutation({
    refetchQueries: ['GetBookings'],
  });
  const [cancelBooking] = useCancelBookingMutation({
    refetchQueries: ['GetBookings'],
  });

  const canInteract = !!userInfo.data?.userInfo.roles.some(
    (role) => role.value === 'USER'
  );

  const events = useMemo(() => {
    const _events: EventInput[] = [];

    getBookings.data?.getBookings.forEach((slot) => {
      const dateStr = slot.date as string;
      const startDate = new Date(dateStr);

      if (!slot.isAvailable) {
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
            isAvailable: !!slot.isAvailable,
            canCancel: !!booking.canCancel,
          },
        })
      );
    });

    return _events;
  }, [getBookings.data?.getBookings]);

  const handleDateSelect = useCallback(
    async (selectInfo: DateSelectArg) => {
      console.log(selectInfo);

      if (!canInteract) return;

      const calendarApi = selectInfo.view.calendar;
      calendarApi.unselect();

      const { errors, data } = await book({
        variables: {
          spaceId,
          year: selectInfo.start.getFullYear(),
          month: selectInfo.start.getMonth(),
          day: selectInfo.start.getDate(),
        },
      });

      if (errors) return console.error(errors);

      if (data?.book.errors) return setGlobalErrors(data.book.errors);

      setGlobalErrors([]);
    },
    [book, canInteract, spaceId]
  );

  const handleEventClick = useCallback(
    async (clickInfo: EventClickArg) => {
      if (!canInteract) return;

      if (
        clickInfo.event.extendedProps.isBackground ||
        !clickInfo.event.extendedProps.canCancel
      )
        return;

      await cancelBooking({
        variables: { bookingId: clickInfo.event.id },
      });
    },
    [cancelBooking, canInteract]
  );

  const renderEventContent = (eventContent: EventContentArg) => (
    <div>
      <span>{eventContent.event.title}</span>
      {eventContent.event._def.extendedProps.canCancel && (
        <button>cancel</button>
      )}
    </div>
  );

  const renderDayCellContent = ({ dayNumberText }: DayCellContentArg) => {
    return <div>{dayNumberText}</div>;
  };

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
            <ErrorList errors={globalErrors} />
            {!getBookings.loading ? (
              !getBookings.error && getBookings.data ? (
                <div>
                  <FullCalendar
                    plugins={[interactionPlugin, dayGridPlugin]}
                    events={events}
                    selectable={canInteract}
                    select={handleDateSelect}
                    eventClick={handleEventClick}
                    eventContent={renderEventContent}
                    dayCellContent={renderDayCellContent}
                    selectAllow={({ start }) => {
                      return start.getTime() >= new Date().setHours(0, 0, 0, 0);
                    }}
                    selectOverlap={(event) => !!event.extendedProps.isAvailable}
                    dayMaxEventRows={MAX_DAY_EVENT_ROWS}
                    defaultAllDay
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
