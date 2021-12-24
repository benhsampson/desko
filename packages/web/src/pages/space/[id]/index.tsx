import { NextPage } from 'next';
import {
  AppBar,
  Box,
  IconButton,
  InputAdornment,
  Stack,
  StackProps,
  TextField,
  Toolbar,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import {
  CalendarContainer,
  CalendarDateActions,
  CalendarView,
  CalendarViewRadioButtons,
} from '@desko/calendar';

import getBaseUrl from '../../../lib/utils/getBaseUrl';
import getCtxQueryVar from '../../../lib/utils/getCtxQueryVar';
import withApollo from '../../../lib/utils/withApollo';
import withAuth from '../../../lib/utils/withAuth';
import {
  GetBookingsQuery,
  useSpaceDataQuery,
  useBookMutation,
  useCancelBookingMutation,
} from '../../../__generated__/graphql';
import DashboardLayout from '../../../components/DashboardLayout';
import ErrorDisplay from '../../../components/ErrorDisplay';
import Loader from '../../../components/Loader';
import useCopyToClipboard from 'packages/web/src/lib/utils/useCopyToClipboard';
import { useRef } from 'react';
import { useEffect } from 'react';

type Props = {
  url: string;
  prettyUrl: string;
  spaceId: string;
};

const SpacePage: NextPage<Props> = ({ url, prettyUrl, spaceId }) => {
  const prevStart = useRef<string>('');
  const prevEnd = useRef<string>('');
  const { error, loading, data, refetch } = useSpaceDataQuery({
    variables: { spaceId, start: '', end: '' },
  });
  const [book] = useBookMutation({
    refetchQueries: ['SpaceData'],
  });
  const [cancelBooking] = useCancelBookingMutation({
    refetchQueries: ['SpaceData'],
  });

  useEffect(() => {
    void refetch({ spaceId, start: prevStart.current, end: prevEnd.current });
  }, [spaceId, refetch]);

  const bookingSlotToEventSlot = (
    slot: GetBookingsQuery['getBookings'][number]
  ) => ({
    date: slot.date,
    events: slot.bookings.map((b) => ({
      id: b.id,
      name: b.user.fullName,
      canDelete: b.canCancel ?? false,
    })),
    canCreate: slot.isAvailable ?? undefined,
  });

  const ToolbarItem = ({ ...toolbarItemProps }: StackProps) => (
    <Stack
      direction={{ xs: 'column', md: 'row' }}
      spacing={2}
      {...toolbarItemProps}
    />
  );

  const isManager = data?.userInfo.roles[0].value === 'MANAGER';
  const isUser = data?.userInfo.roles[0].value === 'USER';

  const [, copy] = useCopyToClipboard();
  const linkText = `${prettyUrl}/invite/${data?.spaceInfo.code || ''}`;

  return (
    <DashboardLayout cancelBorder>
      <CalendarContainer
        onDateChange={async (start, end) => {
          prevStart.current = start;
          prevEnd.current = end;
          await refetch({ spaceId, start, end });
        }}
      >
        {!error ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              minHeight: '100vh',
            }}
          >
            <AppBar
              position="relative"
              variant="outlined"
              color="default"
              elevation={0}
              sx={{ padding: (theme) => ({ xs: theme.spacing(2, 0), md: 0 }) }}
            >
              <Toolbar>
                <ToolbarItem
                  justifyContent={{ sm: 'space-between' }}
                  width="100%"
                >
                  <ToolbarItem spacing={1}>
                    <CalendarViewRadioButtons isDisabled={loading} />
                    <CalendarDateActions isDisabled={loading} />
                  </ToolbarItem>
                  {!loading ? (
                    isManager ? (
                      <ToolbarItem>
                        <TextField
                          disabled
                          value={linkText}
                          variant="outlined"
                          size="small"
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton
                                  onClick={() =>
                                    void copy(
                                      `${url}/invite/${data.spaceInfo.code}`
                                    )
                                  }
                                >
                                  <ContentCopyIcon />
                                </IconButton>
                              </InputAdornment>
                            ),
                          }}
                          sx={{
                            '.MuiInputBase-input': {
                              width: `${linkText.length}ch`,
                            },
                          }}
                        />
                      </ToolbarItem>
                    ) : null
                  ) : (
                    <Loader />
                  )}
                </ToolbarItem>
              </Toolbar>
            </AppBar>
            <CalendarView
              eventSlots={data?.getBookings.map(bookingSlotToEventSlot) || []}
              createEvent={(date) => {
                void book({ variables: { spaceId, date } });
              }}
              deleteEvent={(bookingId) => {
                void cancelBooking({ variables: { bookingId } });
              }}
              canCreate={isUser}
            />
          </Box>
        ) : (
          <ErrorDisplay error={error} />
        )}
      </CalendarContainer>
    </DashboardLayout>
  );
};

// eslint-disable-next-line @typescript-eslint/require-await
SpacePage.getInitialProps = async (ctx) => {
  const { raw, pretty } = getBaseUrl(ctx.req);
  const spaceId = getCtxQueryVar(ctx.query, 'id');
  console.log(pretty);
  return { url: raw, prettyUrl: pretty, spaceId };
};

export default withApollo(withAuth(SpacePage));
