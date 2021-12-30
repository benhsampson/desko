import { NextPage } from 'next';
import { useRef, useState, useEffect } from 'react';
import {
  AppBar,
  Box,
  IconButton,
  InputAdornment,
  Snackbar,
  Stack,
  StackProps,
  TextField,
  Toolbar,
  useTheme,
  useMediaQuery,
  Fab,
  DialogTitle,
  DialogContent,
  DialogContentText,
  Dialog,
  Button,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
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
  SpaceDataQuery,
} from '../../../__generated__/graphql';
import DashboardLayout from '../../../components/DashboardLayout';
import Loader from '../../../components/Loader';
import useCopyToClipboard from 'packages/web/src/lib/utils/useCopyToClipboard';
import { NextLinkComposed } from 'packages/web/src/components/Link';
import ErrorDisplay from 'packages/web/src/components/ErrorDisplay';
import useSnackbar from 'packages/web/src/lib/utils/useSnackbar';

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
  const [book, bookOut] = useBookMutation({
    refetchQueries: ['SpaceData'],
  });
  const [cancelBooking] = useCancelBookingMutation({
    refetchQueries: ['SpaceData'],
  });

  useEffect(() => {
    void refetch({ spaceId, start: prevStart.current, end: prevEnd.current });
  }, [spaceId, refetch]);

  const bookingSlotToEventSlot = (
    slot: SpaceDataQuery['getBookings'][number]
  ) => ({
    date: slot.date,
    events: slot.bookings.map((b) => ({
      id: b.id,
      name: b.user.fullName,
      canDelete: b.canCancel ?? false,
    })),
    canCreate: slot.isAvailable ?? undefined,
    isMaxed: slot.isMaxed ?? undefined,
  });

  const ToolbarItem = ({ ...toolbarItemProps }: StackProps) => (
    <Stack
      direction={{ xs: 'column', md: 'row' }}
      spacing={2}
      {...toolbarItemProps}
    />
  );

  const isManager = data?.userInfo.roles[0].value === 'MANAGER';
  // const isUser = data?.userInfo.roles[0].value === 'USER';

  const [, copy] = useCopyToClipboard();
  const linkText = `${prettyUrl}/invite/${data?.spaceInfo.code || ''}`;

  const sb = useSnackbar();

  useEffect(() => {
    if (bookOut.data?.book.errors?.length) {
      sb.handleOpen();
    }
  }, [bookOut.data?.book.errors, sb]);

  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.down('sm'));

  const [isBookModalOpen, setIsBookModalOpen] = useState(false);

  return (
    <DashboardLayout cancelBorder>
      <Snackbar
        open={sb.isOpen}
        autoHideDuration={5000}
        onClose={sb.handleClose}
        message="Day at full capacity. Try another time."
        action={
          <IconButton size="small" color="inherit" onClick={sb.handleClose}>
            <CloseIcon fontSize="small" />
          </IconButton>
        }
      />
      <CalendarContainer
        onDateChange={async (start, end) => {
          prevStart.current = start;
          prevEnd.current = end;
          await refetch({ spaceId, start, end });
        }}
        defaultView={matches ? 'DAY' : 'MONTH'}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            minHeight: '100vh',
          }}
        >
          <Dialog
            onClose={() => setIsBookModalOpen(false)}
            open={isBookModalOpen}
          >
            <DialogTitle>Book Spaces</DialogTitle>
            <DialogContent>
              <DialogContentText>{`To book a space, simply click on the day you'd like to book in the Day/Month view.`}</DialogContentText>
            </DialogContent>
          </Dialog>
          <Fab
            onClick={() => setIsBookModalOpen(true)}
            color="primary"
            sx={{
              position: 'absolute',
              bottom: 16,
              right: 16,
              zIndex: 2,
            }}
          >
            <AddIcon />
          </Fab>
          {error && <ErrorDisplay error={error} />}
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
                      <Button
                        component={NextLinkComposed}
                        color="inherit"
                        to={`/space/${spaceId}/edit`}
                        startIcon={<EditIcon />}
                      >
                        {`Edit ${data.spaceInfo.name}`}
                      </Button>
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
            canCreate={true}
          />
        </Box>
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
