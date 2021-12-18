import moment from 'moment';
import {
  decrementMonth,
  incrementMonth,
  selectDate,
  setDate,
} from '../lib/features/calendar/calendarSlice';
import { useAppDispatch, useAppSelector } from '../lib/hooks';

type Props = {
  children: (props: {
    date: ReturnType<typeof selectDate>;
    formattedDate: string;
    setDate: (...args: Parameters<typeof setDate>) => void;
    incrementMonth: () => void;
    decrementMonth: () => void;
  }) => React.ReactNode;
};

const CalendarDateActions = ({ children }: Props) => {
  const date = useAppSelector(selectDate);
  const dispatch = useAppDispatch();
  return (
    <>
      {children({
        date,
        formattedDate: moment(date).format('MMMM YYYY'),
        setDate: (newDate) => {
          dispatch(setDate(newDate));
        },
        incrementMonth: () => {
          dispatch(incrementMonth());
        },
        decrementMonth: () => {
          dispatch(decrementMonth());
        },
      })}
    </>
  );
};

export default CalendarDateActions;
