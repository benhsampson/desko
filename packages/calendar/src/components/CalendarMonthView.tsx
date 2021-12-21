import moment from 'moment';
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
} from '@mui/material';
import { useSelector } from 'react-redux';

import { selectDate, setRange } from '../lib/features/calendar/calendarSlice';
import CalendarEventList from './CalendarEventList';
import { useAppDispatch } from '../lib/hooks';
import { CalendarEvent } from '../lib/types/CalendarEvent';
import formatAsTimestamp from '../lib/utils/formatAsTimestamp';

class Slot {
  constructor(
    content: string,
    isCurrentMonth: boolean,
    events: CalendarEvent[]
  ) {
    this.content = content;
    this.isCurrentMonth = isCurrentMonth;
    this.events = events;
  }

  content!: string;
  isCurrentMonth!: boolean;
  events!: CalendarEvent[];
}

const TABLE_HEAD_HEIGHT = 33;

const Table = styled(MuiTable)(() => ({
  display: 'flex',
  flexDirection: 'column',
  tableLayout: 'unset',
}));

interface TableCellProps extends MuiTableCellProps {
  isWashed?: boolean;
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
  shouldForwardProp: (prop) => prop !== 'isWashed',
})<TableCellProps>(({ theme, isWashed }) => ({
  display: 'block',
  backgroundColor: isWashed
    ? `rgba(0,0,0,0.05)`
    : theme.palette.background.paper,
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

export default function CalendarMonthView() {
  const WEEKDAYS = moment.weekdaysShort();

  const dispatch = useAppDispatch();
  const date = useSelector(selectDate);

  const [rows, setRows] = useState<Slot[][]>([]);

  useEffect(() => {
    void (function run() {
      const momentPreviousMonth = moment(date).subtract(1, 'M');
      const momentNow = moment(date);
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
        const d = sD + i;
        return new Slot(`${d}`, false, []);
      });
      const thisM = Array.from({ length: numberOfDaysThisMonth }, (_, i) => {
        const d = i + 1;
        // const ts = momentNow.set('D', d).format(TIMESTAMP_FORMAT);
        return new Slot(
          d === 1 ? `${momentNow.format('MMM')} 1` : `${d}`,
          true,
          []
        );
      });
      const nextM = Array.from({ length: nextCount }, (_, i) => {
        const d = i + 1;
        return new Slot(
          d === 1 ? `${momentNextMonth.format('MMM')} 1` : `${d}`,
          false,
          []
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

  const slotRenderer = (slot: Slot, index: number) => {
    return (
      <TableCell key={`Slot${index}`} isWashed={!slot.isCurrentMonth}>
        <DayNumber>{slot.content}</DayNumber>
        {slot.events && <CalendarEventList events={slot.events} maxRows={4} />}
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
