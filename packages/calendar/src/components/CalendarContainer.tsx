import { useSelector } from 'react-redux';
import { LocalizationProvider } from '@mui/lab';
import DateAdapter from '@mui/lab/AdapterMoment';

import { selectRange } from '../lib/features/calendar/calendarSlice';
import { useEffect } from 'react';
import withRedux from '../lib/utils/withRedux';

type Props = {
  onDateChange: (start: string, end: string) => void | Promise<void>;
};

const CalendarContainer: React.FC<Props> = ({ children, onDateChange }) => {
  const [start, end] = useSelector(selectRange);

  useEffect(() => {
    if (start && end) {
      void onDateChange(start, end);
    }
  }, [start, end]);

  return (
    <LocalizationProvider dateAdapter={DateAdapter}>
      {children}
    </LocalizationProvider>
  );
};

export default withRedux(CalendarContainer);
