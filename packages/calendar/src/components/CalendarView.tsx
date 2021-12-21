import { useSelector } from 'react-redux';

import { selectView } from '../lib/features/view/viewSlice';
import CalendarMonthView from './CalendarMonthView';
import CalendarDayView from './CalendarDayView';
import { CalendarEventSlot } from '../lib/types/CalendarEventSlot';

export type CalendarViewProps = {
  eventSlots?: CalendarEventSlot[];
};

export default function CalendarView(props: CalendarViewProps) {
  const view = useSelector(selectView);
  switch (view) {
    case 'MONTH':
      return <CalendarMonthView />;
    case 'DAY':
      return <CalendarDayView />;
    default:
      return null;
  }
}
