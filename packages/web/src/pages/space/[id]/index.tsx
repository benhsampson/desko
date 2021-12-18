import { NextPage } from 'next';
import { useCallback, useMemo, useState } from 'react';
import { Box, IconButton } from '@mui/material';
import FullCalendar from '@fullcalendar/react';
import interactionPlugin from '@fullcalendar/interaction';
import dayGridPlugin from '@fullcalendar/daygrid';
import {
  EventInput,
  DateSelectArg,
  EventContentArg,
  DayCellContentArg,
  EventApi,
} from '@fullcalendar/common';
import { useRouter } from 'next/router';
import CloseIcon from '@mui/icons-material/Close';

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
import withAuth from '../../../lib/utils/withAuth';
import { MAX_DAY_EVENT_ROWS } from '../../../lib/constants';
import ErrorList from '../../../components/ErrorList';
import { isInPast } from '../../../lib/utils/isInPast';
import DashboardLayout from 'packages/web/src/components/DashboardLayout';
import Loader from 'packages/web/src/components/Loader';
import ErrorDisplay from 'packages/web/src/components/ErrorDisplay';
import useCopyToClipboard from 'packages/web/src/lib/utils/useCopyToClipboard';

type Props = {
  prettyBaseUrl: string;
  rawBaseUrl: string;
};

const SpacePage: NextPage<Props> = ({ rawBaseUrl }) => {
  const router = useRouter();
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

      if (!slot.isAvailable && !isInPast(startDate)) {
        _events.push({
          id: dateStr,
          display: 'background',
          start: startDate,
          backgroundColor: 'lightgrey',
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

  const handleCancelClick = useCallback(
    async (event: EventApi) => {
      if (!canInteract) return;

      if (event.extendedProps.isBackground || !event.extendedProps.canCancel)
        return;

      await cancelBooking({
        variables: { bookingId: event.id },
      });
    },
    [cancelBooking, canInteract]
  );

  const renderEventContent = (eventContent: EventContentArg) => (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '24px',
        px: 0.5,
      }}
    >
      <span>{eventContent.event.title}</span>
      {eventContent.event._def.extendedProps.canCancel && (
        <IconButton
          onClick={() => handleCancelClick(eventContent.event)}
          size="small"
          sx={{ color: 'primary.contrastText', p: 0.25 }}
        >
          <CloseIcon sx={{ width: '16px', height: '16px' }} />
        </IconButton>
      )}
    </Box>
  );

  const renderDayCellContent = ({ dayNumberText }: DayCellContentArg) => {
    return <div>{dayNumberText}</div>;
  };

  const [, copyLink] = useCopyToClipboard();

  const isManager = userInfo.data?.userInfo.roles[0].value === 'MANAGER';

  return (
    <DashboardLayout cancelBorder>
      {!spaceInfo.loading ? (
        !spaceInfo.error && spaceInfo.data ? (
          <>
            <ErrorList errors={globalErrors} />
            {!getBookings.loading ? (
              !getBookings.error && getBookings.data ? (
                <Box
                  sx={{
                    '& .fc-header-toolbar': {
                      py: (theme) => theme.spacing(2),
                      pl: (theme) => `calc(${theme.spacing(2)} + 1px)`,
                      pr: (theme) => theme.spacing(2),
                      mb: '0 !important',
                    },
                    '& .fc-spaceName-button, .fc-spaceMaxBookings-button': {
                      color: 'inherit !important',
                      backgroundColor: 'inherit !important',
                      border: 'none !important',
                      boxShadow: 'none !important',
                      cursor: 'default !important',
                    },
                    '& .fc-spaceName-button': {
                      fontWeight: '500 !important',
                    },
                  }}
                >
                  <FullCalendar
                    plugins={[interactionPlugin, dayGridPlugin]}
                    events={events}
                    selectable={canInteract}
                    select={handleDateSelect}
                    // eventClick={handleEventClick}
                    eventContent={renderEventContent}
                    dayCellContent={renderDayCellContent}
                    selectAllow={({ start }) => !isInPast(start)}
                    selectOverlap={(event) => !!event.extendedProps.isAvailable}
                    dayMaxEventRows={MAX_DAY_EVENT_ROWS}
                    customButtons={{
                      spaceName: {
                        text: spaceInfo.data.spaceInfo.name,
                      },
                      spaceMaxBookings: {
                        text: `Max bookings per day: ${spaceInfo.data.spaceInfo.maxBookingsPerDay}`,
                      },
                      copy: {
                        text: `Copy link: desko.io/invite/${spaceInfo.data.spaceInfo.code}`,
                        click: () => {
                          copyLink(
                            `${rawBaseUrl}/invite/${
                              spaceInfo.data?.spaceInfo.code || ''
                            }`
                          ).catch((err) => {
                            throw err;
                          });
                          alert('Copied!');
                        },
                      },
                      edit: {
                        text: 'Edit',
                        click: () => router.push(`/space/${spaceId}/edit`),
                      },
                    }}
                    buttonText={{
                      today: 'This month',
                    }}
                    headerToolbar={{
                      start: 'title',
                      end: `spaceName,spaceMaxBookings${
                        isManager ? ' edit copy ' : ' '
                      }today prev,next`,
                    }}
                    height="100vh"
                    fixedWeekCount={false}
                    defaultAllDay
                  />
                </Box>
              ) : (
                <ErrorDisplay error={getBookings.error} />
              )
            ) : (
              <Loader />
            )}
          </>
        ) : (
          <ErrorDisplay error={spaceInfo.error} />
        )
      ) : (
        <Loader />
      )}
    </DashboardLayout>
  );
};

SpacePage.getInitialProps = async (ctx) => {
  const { pretty, raw } = await Promise.resolve(getBaseUrl(ctx.req));
  return { prettyBaseUrl: pretty, rawBaseUrl: raw };
};

export default withApollo(withAuth(SpacePage));
