import { useSelector } from 'react-redux';

import { selectView } from '../lib/features/view/viewSlice';
import CalendarMonthView from './CalendarMonthView';
import CalendarDayView from './CalendarDayView';
import { CalendarEvent } from './CalendarEventList';

export type CalendarViewProps = {
  eventSlots: { timestamp: string; events: CalendarEvent[] }[];
};

export default function CalendarView(props: CalendarViewProps) {
  const view = useSelector(selectView);
  switch (view) {
    case 'MONTH':
      return <CalendarMonthView {...props} />;
    case 'DAY':
      return <CalendarDayView />;
    default:
      return null;
  }
}
