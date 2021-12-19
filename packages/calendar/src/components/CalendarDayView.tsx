import {
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from '@mui/material';
import moment from 'moment';
import { useSelector } from 'react-redux';
import { selectDate } from '../lib/features/calendar/calendarSlice';

export default function CalendarDayView() {
  const date = useSelector(selectDate);

  return (
    <TableContainer sx={{ display: 'flex', flexGrow: 1 }}>
      <Table stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell>{moment(date).format('dddd, MMMM Do YYYY')}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell>Events go here</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
}
