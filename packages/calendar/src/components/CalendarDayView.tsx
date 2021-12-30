import {
  TableContainer,
  Table as MuiTable,
  TableHead as MuiTableHead,
  TableBody as MuiTableBody,
  TableRow as MuiTableRow,
  TableCell as MuiTableCell,
  styled,
  ButtonBase,
  Chip,
} from '@mui/material';
import moment from 'moment';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { selectDate, setRange } from '../lib/features/calendar/calendarSlice';
import { formatISOAsTimestamp } from '../lib/utils/formatAsTimestamp';
import CalendarEventList from './CalendarEventList';
import { CalendarViewProps } from './CalendarView';

const Table = styled(MuiTable)({
  display: 'grid',
  gridTemplateRows: 'auto 1fr',
});

const TableHead = styled(MuiTableHead)({});

const TableBody = styled(MuiTableBody)({});

const TableRow = styled(MuiTableRow)({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  height: '100%',
});

const TableCell = styled(MuiTableCell)(({ theme }) => ({
  display: 'inline-flex',
  alignItems: 'stretch',
  justifyContent: 'flex-start',
  padding: theme.spacing(1),
  width: '100%',
  height: '100%',
}));

const MaxedFlag = styled(Chip)({
  position: 'absolute',
  top: 4,
  right: 8,
});

export default function CalendarDayView(props: CalendarViewProps) {
  const dispatch = useDispatch();
  const date = useSelector(selectDate);
  const slot = date
    ? props.eventSlots?.find((slot) => slot.date === formatISOAsTimestamp(date))
    : undefined;

  useEffect(() => {
    if (date) {
      dispatch(
        setRange({
          start: formatISOAsTimestamp(date),
          end: formatISOAsTimestamp(date),
        })
      );
    }
  }, [date]);

  const isTodayOrFuture = moment(date).isSameOrAfter(undefined, 'D');
  // console.log(props.canCreate, isTodayOrFuture, slot?.canCreate);
  const canCreate =
    props.canCreate && isTodayOrFuture && (slot?.canCreate ?? true);
  const handleClick = (clickedDate: string) => {
    props.createEvent && props.createEvent(clickedDate);
  };
  return (
    <TableContainer sx={{ display: 'flex', flexGrow: 1 }}>
      <Table stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell>
              {moment(date).format('dddd, MMMM Do YYYY')}
              {slot?.isMaxed ? (
                <MaxedFlag
                  color="warning"
                  variant="outlined"
                  label="Fully Booked"
                />
              ) : null}
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell
              as={canCreate ? ButtonBase : undefined}
              onClick={
                canCreate && date
                  ? () => handleClick(formatISOAsTimestamp(date))
                  : () => null
              }
            >
              <CalendarEventList
                events={slot?.events || []}
                maxRows={3}
                handleDeleteEvent={props.deleteEvent}
              />
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
}
