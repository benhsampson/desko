import { useDispatch, useSelector } from 'react-redux';
import { LocalizationProvider } from '@mui/lab';
import { useEffect, useRef } from 'react';
import DateAdapter from '@mui/lab/AdapterMoment';

import { selectRange } from '../lib/features/calendar/calendarSlice';
import withRedux from '../lib/utils/withRedux';
import { setView, View } from '../lib/features/view/viewSlice';

type Props = {
  onDateChange: (start: string, end: string) => void | Promise<void>;
  defaultView?: View;
};

const CalendarContainer: React.FC<Props> = ({
  children,
  onDateChange,
  defaultView,
}) => {
  const [start, end] = useSelector(selectRange);
  const dispatch = useDispatch();

  const init = useRef(0);
  useEffect(() => {
    console.log('USE EFFECT HOOK', defaultView);
    if (defaultView && init.current < 2) {
      init.current++;
      console.log('SETTING VIEW');
      dispatch(setView(defaultView));
    }
  }, [defaultView]);

  useEffect(() => {
    console.log(start, end);

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
