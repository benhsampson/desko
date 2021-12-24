import moment, { MomentInput } from 'moment';
import { useEffect, useState } from 'react';
import {
  Box,
  TableContainer,
  Table as MuiTable,
  TableHead as MuiTableHead,
  TableBody as MuiTableBody,
  TableRow as MuiTableRow,
  TableCell as MuiTableCell,
  TableCellProps as MuiTableCellProps,
  styled,
  ButtonBase,
} from '@mui/material';
import { useSelector } from 'react-redux';
import * as colors from '@mui/material/colors';

import { selectDate, setRange } from '../lib/features/calendar/calendarSlice';
import CalendarEventList from './CalendarEventList';
import { useAppDispatch } from '../lib/hooks';
import { CalendarEvent } from '../lib/types/CalendarEvent';
import formatAsTimestamp from '../lib/utils/formatAsTimestamp';
import { CalendarViewProps } from './CalendarView';

class Slot {
  constructor(
    content: string,
    isCurrentMonth: boolean,
    isCurrentDay: boolean,
    events: CalendarEvent[],
    timestamp: string
  ) {
    this.content = content;
    this.isCurrentMonth = isCurrentMonth;
    this.isCurrentDay = isCurrentDay;
    this.events = events;
    this.timestamp = timestamp;
  }

  content!: string;
  isCurrentMonth!: boolean;
  isCurrentDay!: boolean;
  events!: CalendarEvent[];
  timestamp!: string;
}

const TABLE_HEAD_HEIGHT = 33;

const Table = styled(MuiTable)(() => ({
  display: 'flex',
  flexDirection: 'column',
  tableLayout: 'unset',
}));

interface TableCellProps extends MuiTableCellProps {
  isWashed?: boolean;
  isHighlighted?: boolean;
}

const TableHead = styled(MuiTableHead)({
  display: 'block',
});

const TableBody = styled(MuiTableBody, {
  shouldForwardProp: (prop) => prop !== 'rows',
})<{ rows: number }>(({ rows }) => ({
  display: 'grid',
  gridTemplateRows: `repeat(${rows}, 1fr)`,
  flexGrow: 1,
}));

const TableRow = styled(MuiTableRow)({
  display: 'grid',
  gridTemplateColumns: 'repeat(7, 1fr)',
});

const TableCell = styled(MuiTableCell, {
  shouldForwardProp: (prop) => prop !== 'isWashed' && prop !== 'isHighlighted',
})<TableCellProps>(({ theme, isWashed, isHighlighted }) => ({
  display: 'inline-flex',
  flexDirection: 'column',
  justifyContent: 'flex-start',
  alignItems: 'stretch',
  backgroundColor: isHighlighted
    ? colors.yellow[50]
    : isWashed
    ? `rgba(0,0,0,0.05)`
    : theme.palette.background.paper,
  color: isWashed ? theme.palette.text.secondary : theme.palette.text.primary,
  position: 'relative',
  padding: theme.spacing(0.5, 1),
  verticalAlign: 'text-top',

  '&:not(:last-child)': {
    borderRight: `1px solid ${theme.palette.divider}`,
  },
}));

const DayNumber = styled(Box)(({ theme }) => ({
  fontFamily: 'monospace',
  padding: theme.spacing(0.5, 0),
}));

const smallestNumberGreaterThanOrEqualToNDivisibleByK = (
  n: number,
  k: number
) => {
  const r = (n + k) % k;

  if (r === 0) {
    return n;
  } else {
    return n + k - r;
  }
};

export default function CalendarMonthView(props: CalendarViewProps) {
  const WEEKDAYS = moment.weekdaysShort();

  const dispatch = useAppDispatch();
  const date = useSelector(selectDate);

  const [rows, setRows] = useState<Slot[][]>([]);

  const isToday = (input: MomentInput) => moment(input).isSame(new Date(), 'D');

  useEffect(() => {
    void (function run() {
      const momentNow = moment(date);
      const momentPreviousMonth = moment(date).subtract(1, 'M');
      const momentNextMonth = moment(date).add(1, 'M');
      const numberOfDaysThisMonth = momentNow.daysInMonth();
      const firstDayOfThisMonth = parseInt(
        momentNow.startOf('month').format('d'),
        10
      );
      const lastDayOfPreviousMonth = parseInt(
        momentPreviousMonth.endOf('month').format('D'),
        10
      );

      const prevCount = firstDayOfThisMonth;

      const start = prevCount === 0 ? momentNow : momentPreviousMonth;
      const sY = start.year();
      const sM = start.month();
      const sD =
        (prevCount === 0 ? 0 : lastDayOfPreviousMonth - firstDayOfThisMonth) +
        1;
      const startTimestamp = formatAsTimestamp(sY, sM, sD);

      const n = prevCount + numberOfDaysThisMonth;
      const nextCount =
        smallestNumberGreaterThanOrEqualToNDivisibleByK(n, 7) - n;

      const end = nextCount === 0 ? momentNow : momentNextMonth;
      const eY = end.year();
      const eM = end.month();
      const eD = nextCount === 0 ? numberOfDaysThisMonth : nextCount;
      const endTimestamp = formatAsTimestamp(eY, eM, eD);

      dispatch(setRange({ start: startTimestamp, end: endTimestamp }));

      const prevM = Array.from({ length: prevCount }, (_, i) => {
        const y = momentPreviousMonth.year();
        const m = momentPreviousMonth.month();
        const d = sD + i;
        return new Slot(
          `${d}`,
          false,
          isToday([y, m, d]),
          [],
          formatAsTimestamp(y, m, d)
        );
      });
      const thisM = Array.from({ length: numberOfDaysThisMonth }, (_, i) => {
        const y = momentNow.year();
        const m = momentNow.month();
        const d = i + 1;
        return new Slot(
          d === 1 ? `${momentNow.format('MMM')} 1` : `${d}`,
          true,
          isToday([y, m, d]),
          [],
          formatAsTimestamp(y, m, d)
        );
      });
      const nextM = Array.from({ length: nextCount }, (_, i) => {
        const y = momentNextMonth.year();
        const m = momentNextMonth.month();
        const d = i + 1;
        return new Slot(
          d === 1 ? `${momentNextMonth.format('MMM')} 1` : `${d}`,
          false,
          isToday([y, m, d]),
          [],
          formatAsTimestamp(y, m, d)
        );
      });

      const slots = [...prevM, ...thisM, ...nextM];
      const _rows = slots.reduce((rows, slot, index) => {
        const lastRow =
          rows.length > 0 && index % 7 !== 0
            ? rows[rows.length - 1]
            : rows[rows.push([]) - 1];
        lastRow.push(slot);
        rows[rows.length - 1] = lastRow;
        return rows;
      }, [] as Slot[][]);

      setRows(_rows);
    })();
  }, [date]);

  const handleSlotClick = (date: string) => () => {
    void (props.createEvent && props.createEvent(date));
  };

  const slotRenderer = (slot: Slot, index: number) => {
    const eventSlot = props.eventSlots?.find((s) => s.date === slot.timestamp);
    const isTodayOrFuture = moment(slot.timestamp).isSameOrAfter(
      undefined,
      'D'
    );
    const canCreate =
      props.canCreate && isTodayOrFuture && (eventSlot?.canCreate ?? true);
    return (
      <TableCell
        key={`Slot${index}`}
        isWashed={!slot.isCurrentMonth}
        isHighlighted={slot.isCurrentDay}
        as={canCreate ? ButtonBase : undefined}
        onClick={canCreate ? handleSlotClick(slot.timestamp) : () => null}
      >
        <DayNumber>{slot.content}</DayNumber>
        <CalendarEventList
          events={eventSlot?.events || []}
          maxRows={3}
          handleDeleteEvent={props.deleteEvent}
        />
      </TableCell>
    );
  };

  return (
    <TableContainer sx={{ display: 'flex', flexGrow: 1 }}>
      <Table stickyHeader>
        <TableHead sx={{ height: TABLE_HEAD_HEIGHT }}>
          <TableRow>
            {WEEKDAYS.map((day) => (
              <TableCell key={day}>{day}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody rows={rows.length}>
          {rows.map((slots, ri) => (
            <TableRow key={`Row${ri}`}>
              {slots.map((slot, si) => slotRenderer(slot, si))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
