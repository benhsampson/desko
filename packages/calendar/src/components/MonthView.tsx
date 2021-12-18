import moment from 'moment';
import { useEffect, useState } from 'react';
import {
  Box,
  TableContainer,
  Table as MuiTable,
  TableHead,
  TableRow,
  TableCell as MuiTableCell,
  TableCellProps as MuiTableCellProps,
  TableBody,
  styled,
} from '@mui/material';

class Slot {
  constructor(content: string, isCurrentMonth: boolean) {
    this.content = content;
    this.isCurrentMonth = isCurrentMonth;
  }

  content!: string;
  isCurrentMonth!: boolean;
}

const Table = styled(MuiTable)(() => ({
  tableLayout: 'fixed',
}));

interface TableCellProps extends MuiTableCellProps {
  isWashed?: boolean;
}

const TableCell = styled(MuiTableCell, {
  shouldForwardProp: (prop) => prop !== 'isWashed',
})<TableCellProps>(({ theme, isWashed }) => ({
  width: `${100 / 7}%`,
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

export default function MonthView() {
  const WEEKDAYS = moment.weekdaysShort();
  const momentPreviousMonth = moment(date).subtract(1, 'M');
  const momentNow = moment(date);
  const momentNextMonth = moment(date).add(1, 'M');

  const DAYS_IN_THIS_MONTH = momentNow.daysInMonth();
  const FIRST_DAY_OF_THIS_MONTH = parseInt(
    momentNow.startOf('month').format('d'),
    10
  );
  const LAST_DAY_OF_PREVIOUS_MONTH = parseInt(
    momentPreviousMonth.endOf('month').format('D'),
    10
  );

  const [rows, setRows] = useState<Slot[][]>([]);

  useEffect(() => {
    const previous = Array.from(
      { length: FIRST_DAY_OF_THIS_MONTH },
      (_, i) => new Slot(`${LAST_DAY_OF_PREVIOUS_MONTH - i}`, false)
    ).reverse();
    const days = [
      ...Array.from(
        { length: DAYS_IN_THIS_MONTH },
        (_, i) =>
          new Slot(i === 0 ? `${momentNow.format('MMM')} 1` : `${i + 1}`, true)
      ),
    ];
    const slots = [...previous, ...days];
    const _rows = slots.reduce((rows, slot, index) => {
      const lastRow =
        rows.length > 0 && index % 7 !== 0
          ? rows[rows.length - 1]
          : rows[rows.push([]) - 1];
      lastRow.push(slot);
      if (index === slots.length - 1) {
        const future = Array.from(
          { length: 7 - lastRow.length },
          (_, i) =>
            new Slot(
              i === 0 ? `${momentNextMonth.format('MMM')} 1` : `${i + 1}`,
              false
            )
        );
        lastRow.push(...future);
      }
      rows[rows.length - 1] = lastRow;
      return rows;
    }, [] as Slot[][]);
    setRows(_rows);
  }, [date]);

  const slotRenderer = (slot: Slot, index: number) => {
    return (
      <TableCell key={`Slot${index}`} isWashed={!slot.isCurrentMonth}>
        <DayNumber>{slot.content}</DayNumber>
      </TableCell>
    );
  };

  return (
    <TableContainer sx={{ display: 'flex', flexGrow: 1 }}>
      <Table stickyHeader>
        <TableHead>
          <TableRow>
            {WEEKDAYS.map((day) => (
              <TableCell key={day}>{day}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
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
